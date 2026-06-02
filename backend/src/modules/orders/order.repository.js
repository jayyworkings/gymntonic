const db = require('../../config/database');

class OrderRepository {
  async findCartItems(userId) {
    return db('cart_items')
      .join('products', 'cart_items.product_id', 'products.id')
      .leftJoin('product_variants', 'cart_items.variant_id', 'product_variants.id')
      .select('cart_items.*', 'products.name as product_name', 'products.price', 'products.weight',
        'product_variants.name as variant_name', 'product_variants.price_modifier')
      .where({ 'cart_items.user_id': userId });
  }

  async findCoupon(code) {
    return db('coupons')
      .where({ code: code.toUpperCase(), is_active: true })
      .where('valid_from', '<=', new Date())
      .where('valid_until', '>=', new Date())
      .first();
  }

  async incrementCouponUsage(id) {
    return db('coupons').where({ id }).increment('times_used', 1);
  }

  async findShippingAddress(id, userId) {
    return db('shipping_addresses').where({ id, user_id: userId }).first();
  }

  async createOrderTx(orderData, orderItems, cartItems, userId) {
    return db.transaction(async (trx) => {
      const [newOrder] = await trx('orders').insert(orderData).returning('*');

      const items = orderItems.map(item => ({ ...item, order_id: newOrder.id }));
      await trx('order_items').insert(items);

      for (const item of cartItems) {
        await trx('products').where({ id: item.product_id })
          .decrement('stock_quantity', item.quantity)
          .increment('total_sold', item.quantity);
      }

      await trx('cart_items').where({ user_id: userId }).del();
      return newOrder;
    });
  }

  async findUserOrders(userId, limit, offset) {
    return db('orders')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit).offset(offset);
  }

  async countUserOrders(userId) {
    const [{ count }] = await db('orders').where({ user_id: userId }).count('id as count');
    return parseInt(count);
  }

  async findOrderById(id, userId) {
    return db('orders').where({ id, user_id: userId }).first();
  }

  async findOrderItems(orderId) {
    return db('order_items').where({ order_id: orderId });
  }

  async findOrderPayments(orderId) {
    return db('payments').where({ order_id: orderId });
  }

  async findOrderByIdAdmin(id) {
    return db('orders').where({ id }).first();
  }

  async updateOrderStatusTx(orderId, update, isCancelled, oldStatus) {
    return db.transaction(async (trx) => {
      const [o] = await trx('orders').where({ id: orderId }).update(update).returning('*');

      if (oldStatus !== 'cancelled' && isCancelled) {
        const items = await trx('order_items').where({ order_id: orderId });
        for (const item of items) {
          await trx('products').where({ id: item.product_id })
            .increment('stock_quantity', item.quantity)
            .decrement('total_sold', item.quantity);
        }
      }

      // Paystack refund logic could be extracted here or to a separate payment service
      if (oldStatus !== 'refunded' && update.status === 'refunded') {
        const payment = await trx('payments').where({ order_id: orderId, method: 'paystack', status: 'success' }).first();
        if (payment) {
          const https = require('https');
          const params = JSON.stringify({ transaction: payment.reference });
          const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/refund',
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          };
          const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => console.log('Paystack Refund:', data));
          });
          req.on('error', console.error);
          req.write(params);
          req.end();
        }
      }

      return o;
    });
  }

  async findAllOrdersAdmin(status, limit, offset) {
    let query = db('orders')
      .join('users', 'orders.user_id', 'users.id')
      .select('orders.*', 'users.email', 'users.first_name', 'users.last_name');

    if (status) query = query.where('orders.status', status);

    const [{ count }] = await query.clone().clearSelect().count('orders.id as count');
    const orders = await query.orderBy('orders.created_at', 'desc').limit(limit).offset(offset);

    return { orders, count: parseInt(count) };
  }
}

module.exports = new OrderRepository();
