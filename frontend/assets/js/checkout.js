document.addEventListener('DOMContentLoaded', () => {
  if (!api.token) {
    alert('Please login to checkout.');
    window.location.href = '/login.html';
    return;
  }
  
  loadCheckoutCart();
  
  const checkoutForm = document.getElementById('customCheckoutForm');
  if (checkoutForm) {
    checkoutForm.onsubmit = handleCheckoutSubmit;
  }
});

let cartData = null;

async function loadCheckoutCart() {
  const container = document.getElementById('checkoutCartSummary');
  if (!container) return;

  try {
    const res = await api.cart.get();
    cartData = res.data;

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      container.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }

    let subtotal = 0;
    let html = '<ul>';
    cartData.items.forEach(item => {
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;
      html += `<li>${item.quantity}x ${item.product_name || 'Unknown Product'} - $${itemTotal.toFixed(2)}</li>`;
    });
    html += `</ul><p><strong>Total: $${subtotal.toFixed(2)}</strong></p>`;
    
    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading cart for checkout:', err);
    container.innerHTML = '<p>There was an error loading your cart.</p>';
  }
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  
  if (!cartData || !cartData.items || cartData.items.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  const orderPayload = {
    shipping_address: {
      address_line1: data.address_line1,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country
    },
    shipping_method: data.shipping_method || 'standard',
    payment_method: data.payment_method
  };

  try {
    const res = await api.orders.create(orderPayload);
    const order = res.data;
    
    alert('Order created successfully! Proceeding to payment...');
    
    // Redirect to payment or handle payment init
    if (data.payment_method === 'crypto') {
      window.location.href = `/payment.html?order_id=${order.id}&method=crypto`;
    } else {
      window.location.href = `/payment.html?order_id=${order.id}&method=paystack`;
    }
  } catch (err) {
    alert(err.message || 'Failed to create order.');
  }
}
