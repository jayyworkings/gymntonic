document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  const method = urlParams.get('method');
  
  if (!orderId || !method) {
    alert('Invalid payment session.');
    window.location.href = '/';
    return;
  }
  
  initPayment(orderId, method);
});

async function initPayment(orderId, method) {
  const container = document.getElementById('PaymentFormPanel');
  if (!container) return;

  try {
    let res;
    if (method === 'paystack') {
      res = await api.payments.initializePaystack(orderId);
    } else if (method.startsWith('crypto')) {
      const cryptoType = method.replace('crypto_', '') || 'btc';
      res = await api.payments.initializeCrypto(orderId, cryptoType);
    } else {
      throw new Error('Unknown payment method');
    }
    const data = res.data;

    if (method === 'paystack') {
      // Redirect to Paystack checkout URL
      if (data.authorization_url) {
        container.innerHTML = '<p>Redirecting to secure payment gateway...</p>';
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No authorization URL received');
      }
    } else if (method === 'crypto') {
      // Display crypto instructions
      container.innerHTML = `
        <h2>Cryptocurrency Payment</h2>
        <div class="BlockContent">
          <p>Please send exactly <strong>${data.amount} ${data.currency}</strong> to the address below:</p>
          <div style="background: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 4px; font-family: monospace; font-size: 16px;">
            ${data.address}
          </div>
          <p>Your payment reference is: <strong>${data.reference}</strong></p>
          
          <hr style="margin: 20px 0;" />
          
          <h3>Confirm Payment</h3>
          <p>Once you have sent the transaction, please enter your transaction hash below:</p>
          <form id="cryptoConfirmForm">
            <input type="text" id="txHash" placeholder="Transaction Hash / ID" required style="width: 100%; max-width: 400px; padding: 10px; margin-bottom: 10px;" />
            <br/>
            <button type="submit" style="padding: 10px 20px; background-color: #3366ff; color: white; border: none; cursor: pointer; font-size: 16px;">Submit Hash</button>
          </form>
        </div>
      `;

      document.getElementById('cryptoConfirmForm').onsubmit = async (e) => {
        e.preventDefault();
        const txHash = document.getElementById('txHash').value;
        try {
          await api.payments.confirmCrypto(data.reference, txHash);
          alert('Payment details submitted successfully. Your order is pending verification.');
          window.location.href = '/account.html';
        } catch (err) {
          alert(err.message || 'Failed to submit payment details.');
        }
      };
    }
  } catch (err) {
    console.error('Error initializing payment:', err);
    container.innerHTML = `<p style="color:red;">There was an error initializing your payment: ${err.message}</p>`;
  }
}
