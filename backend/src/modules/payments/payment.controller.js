const crypto = require('crypto');
const https = require('https');
const db = require('../../config/database');
const { sendPaymentConfirmation } = require('../../utils/email');

class PaymentController {
  // POST /api/v1/payments/paystack/initialize
  async paystackInitialize(req, res, next) {
    try {
      const { order_id } = req.body;
      const order = await db('orders').where({ id: order_id, user_id: req.user.id }).first();
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'pending') {
        return res.status(400).json({ error: 'Order is not in pending status' });
      }

      const reference = `GNT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      // Create payment record
      await db('payments').insert({
        order_id,
        user_id: req.user.id,
        reference,
        method: 'paystack',
        amount: order.total_amount,
        status: 'pending',
      });

      // Initialize Paystack transaction
      const params = JSON.stringify({
        email: req.user.email,
        amount: Math.round(order.total_amount * 100), // Paystack uses kobo/cents
        reference,
        callback_url: `${process.env.FRONTEND_URL}/payment/verify?reference=${reference}`,
        metadata: { order_id, user_id: req.user.id },
      });

      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      };

      const paystackReq = https.request(options, (paystackRes) => {
        let data = '';
        paystackRes.on('data', chunk => data += chunk);
        paystackRes.on('end', () => {
          const response = JSON.parse(data);
          if (response.status) {
            res.json({ data: { authorization_url: response.data.authorization_url, reference } });
          } else {
            res.status(400).json({ error: 'Payment initialization failed' });
          }
        });
      });

      paystackReq.on('error', (err) => next(err));
      paystackReq.write(params);
      paystackReq.end();
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/payments/paystack/verify/:reference
  async paystackVerify(req, res, next) {
    try {
      const { reference } = req.params;

      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: `/transaction/verify/${reference}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      };

      const paystackReq = https.request(options, (paystackRes) => {
        let data = '';
        paystackRes.on('data', chunk => data += chunk);
        paystackRes.on('end', async () => {
          try {
            const response = JSON.parse(data);
            if (response.data && response.data.status === 'success') {
              // Update payment
              await db('payments').where({ reference }).update({
                status: 'success',
                provider_response: JSON.stringify(response.data),
                updated_at: new Date(),
              });

              // Update order status
              const payment = await db('payments').where({ reference }).first();
              await db('orders').where({ id: payment.order_id }).update({
                status: 'paid',
                updated_at: new Date(),
              });

              // Send confirmation
              const user = await db('users').where({ id: payment.user_id }).first();
              sendPaymentConfirmation(user, payment).catch(console.error);

              res.json({ message: 'Payment verified', data: { status: 'success' } });
            } else {
              res.status(400).json({ error: 'Payment verification failed' });
            }
          } catch (err) {
            next(err);
          }
        });
      });

      paystackReq.on('error', err => next(err));
      paystackReq.end();
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/payments/paystack/webhook
  async paystackWebhook(req, res, next) {
    try {
      // Verify webhook signature
      const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const { event, data } = req.body;
      if (event === 'charge.success') {
        await db('payments').where({ reference: data.reference }).update({
          status: 'success',
          provider_response: JSON.stringify(data),
          updated_at: new Date(),
        });

        const payment = await db('payments').where({ reference: data.reference }).first();
        if (payment) {
          await db('orders').where({ id: payment.order_id }).update({
            status: 'paid',
            updated_at: new Date(),
          });
        }
      }

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/payments/crypto/initialize
  async cryptoInitialize(req, res, next) {
    try {
      const { order_id, crypto_type } = req.body; // crypto_type: 'btc', 'eth', 'usdt'

      const wallets = {
        btc: process.env.CRYPTO_WALLET_BTC,
        eth: process.env.CRYPTO_WALLET_ETH,
        usdt: process.env.CRYPTO_WALLET_USDT,
      };

      if (!wallets[crypto_type]) {
        return res.status(400).json({ error: 'Unsupported cryptocurrency' });
      }

      const order = await db('orders').where({ id: order_id, user_id: req.user.id }).first();
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const reference = `GNT-CRYPTO-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      await db('payments').insert({
        order_id,
        user_id: req.user.id,
        reference,
        method: `crypto_${crypto_type}`,
        amount: order.total_amount,
        status: 'pending',
      });

      res.json({
        data: {
          wallet_address: wallets[crypto_type],
          amount_usd: order.total_amount,
          reference,
          instructions: `Send exactly $${order.total_amount} worth of ${crypto_type.toUpperCase()} to the wallet address above. Include reference ${reference} in the memo/note.`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/payments/crypto/confirm (Admin confirms crypto payment)
  async cryptoConfirm(req, res, next) {
    try {
      const { reference, tx_hash } = req.body;

      const [payment] = await db('payments').where({ reference }).update({
        status: 'success',
        crypto_tx_hash: tx_hash,
        updated_at: new Date(),
      }).returning('*');

      if (!payment) return res.status(404).json({ error: 'Payment not found' });

      await db('orders').where({ id: payment.order_id }).update({
        status: 'paid',
        updated_at: new Date(),
      });

      res.json({ message: 'Crypto payment confirmed', data: payment });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
