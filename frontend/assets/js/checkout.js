// GymNTonic Modern Checkout
// Multi-step checkout matching BigCommerce flow

let cartData = null;
let checkoutStep = 1; // 1 = Shipping, 2 = Review & Pay

document.addEventListener('DOMContentLoaded', () => {
  if (!api.token) {
    alert('Please login to checkout.');
    window.location.href = '/login.html';
    return;
  }

  initCheckout();
});

async function initCheckout() {
  const container = document.getElementById('checkoutApp');
  if (!container) return;

  // Load cart data
  try {
    const res = await api.cart.get();
    cartData = res.data;

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:40px;"><h2>Your cart is empty</h2><p><a href="/index.html">Continue Shopping</a></p></div>';
      return;
    }
  } catch (err) {
    container.innerHTML = '<p>Error loading cart. Please try again.</p>';
    return;
  }

  renderStep1();
}

function getSubtotal() {
  if (!cartData || !cartData.items) return 0;
  return cartData.items.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price || 0)), 0);
}

function getTotalItems() {
  if (!cartData || !cartData.items) return 0;
  return cartData.items.reduce((sum, item) => sum + item.quantity, 0);
}

function getItemImage(item) {
  let imgSrc = '';
  if (item.image_url) {
    imgSrc = item.image_url;
    imgSrc = imgSrc.replace(/https?:\/\/(cdn\d+\.bigcommerce\.com)/g, '/$1');
    if (imgSrc.startsWith('//')) imgSrc = imgSrc.replace(/^\/\/(cdn\d+\.bigcommerce\.com)/g, '/$1');
  }
  return imgSrc;
}

function getShippingCost(method) {
  const subtotal = getSubtotal();
  if (method === 'express') return 15.00;
  if (subtotal >= 100) return 0;
  return 9.95;
}

// ─── Cart Summary Bar ─────────────────────────────────────

function renderCartSummaryBar(shippingMethod) {
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const shipping = getShippingCost(shippingMethod || 'standard');
  const total = subtotal + shipping;

  const firstItem = cartData.items[0];
  const firstImg = getItemImage(firstItem);

  return `
    <div id="cartSummaryBar" style="
      position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:2px solid #eee;
      padding:12px 20px; display:flex; align-items:center; justify-content:space-between; z-index:9999;
      box-shadow:0 -2px 10px rgba(0,0,0,0.1); font-family:Arial,sans-serif;
    ">
      <div style="display:flex; align-items:center; gap:12px;">
        ${firstImg ? `<img src="${firstImg}" style="width:40px; height:40px; object-fit:contain; border-radius:4px; border:1px solid #eee;">` : ''}
        <div>
          <strong>${totalItems} Item${totalItems > 1 ? 's' : ''}</strong><br>
          <a href="#" onclick="toggleCartDetails(); return false;" style="color:#3b82f6; font-size:13px;">Show Details</a>
        </div>
      </div>
      <div style="font-size:22px; font-weight:bold; color:#333;">$${total.toFixed(2)}</div>
    </div>
  `;
}

// ─── STEP 1: Shipping ─────────────────────────────────────

function renderStep1() {
  const container = document.getElementById('checkoutApp');
  const user = api.user;

  container.innerHTML = `
    <div style="max-width:520px; margin:0 auto; padding:20px 16px 100px; font-family:Arial,sans-serif;">
      <h1 style="font-size:28px; font-weight:300; color:#333; margin-bottom:4px;">Customer</h1>
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee; margin-bottom:24px;">
        <span style="color:#555;">${user ? user.email : ''}</span>
        <a href="#" onclick="api.logout(); return false;" style="color:#3b82f6; text-decoration:none; font-size:14px;">Sign Out</a>
      </div>

      <h1 style="font-size:28px; font-weight:300; color:#333; margin-bottom:4px;">Shipping</h1>
      
      <h3 style="color:#3b82f6; font-size:16px; margin:16px 0 12px;">Shipping address</h3>
      <div style="border:2px solid #3b82f6; border-radius:8px; padding:16px; margin-bottom:16px;">
        <div style="margin-bottom:10px;">
          <label style="font-size:13px; color:#666; display:block; margin-bottom:4px;">Full Name *</label>
          <input type="text" id="shippingName" value="${user ? (user.first_name + ' ' + user.last_name) : ''}" required 
            style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; box-sizing:border-box;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:13px; color:#666; display:block; margin-bottom:4px;">Phone *</label>
          <input type="text" id="shippingPhone" value="${user && user.phone ? user.phone : ''}" required 
            style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; box-sizing:border-box;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:13px; color:#666; display:block; margin-bottom:4px;">Address Line 1 *</label>
          <input type="text" id="shippingAddress1" required 
            style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; box-sizing:border-box;">
        </div>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <div style="flex:1;">
            <label style="font-size:13px; color:#666; display:block; margin-bottom:4px;">City *</label>
            <input type="text" id="shippingCity" required 
              style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; box-sizing:border-box;">
          </div>
          <div style="flex:1;">
            <label style="font-size:13px; color:#666; display:block; margin-bottom:4px;">State *</label>
            <input type="text" id="shippingState" required 
              style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; box-sizing:border-box;">
          </div>
        </div>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <div style="flex:1;">
            <label style="font-size:13px; color:#666; display:block; margin-bottom:4px;">Zip / Postal Code *</label>
            <input type="text" id="shippingZip" required 
              style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; box-sizing:border-box;">
          </div>
          <div style="flex:1;">
            <label style="font-size:13px; color:#666; display:block; margin-bottom:4px;">Country</label>
            <input type="text" id="shippingCountry" value="United States" 
              style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; font-size:14px; box-sizing:border-box;">
          </div>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <label style="display:flex; align-items:center; gap:8px; font-size:14px; color:#555; cursor:pointer;">
          <input type="checkbox" id="billingSameAsShipping" checked style="width:18px; height:18px; accent-color:#3b82f6;">
          My billing address is the same as my shipping address.
        </label>
      </div>

      <h3 style="color:#3b82f6; font-size:16px; margin:16px 0 12px;">Shipping Method</h3>
      <div style="border:1px solid #ddd; border-radius:8px; padding:16px; margin-bottom:24px;">
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; margin-bottom:8px;">
          <input type="radio" name="shippingMethod" value="standard" checked style="width:18px; height:18px; accent-color:#3b82f6;">
          <span style="flex:1; font-size:14px;">Ship by Order Total</span>
          <span style="font-weight:bold; font-size:14px;">$${getShippingCost('standard').toFixed(2)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
          <input type="radio" name="shippingMethod" value="express" style="width:18px; height:18px; accent-color:#3b82f6;">
          <span style="flex:1; font-size:14px;">Express Shipping</span>
          <span style="font-weight:bold; font-size:14px;">$${getShippingCost('express').toFixed(2)}</span>
        </label>
      </div>

      <h3 style="color:#333; font-size:16px; margin:16px 0 12px;">Order Comments</h3>
      <textarea id="orderComments" rows="3" placeholder="Add any special instructions..."
        style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:14px; resize:vertical; box-sizing:border-box; margin-bottom:24px;"></textarea>

      <button onclick="goToStep2()" style="
        width:100%; padding:16px; background:#333; color:#fff; border:none; border-radius:8px;
        font-size:16px; font-weight:bold; cursor:pointer; letter-spacing:1px; text-transform:uppercase;
      ">CONTINUE</button>
    </div>
    ${renderCartSummaryBar('standard')}
  `;

  // Update shipping cost on radio change
  document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const bar = document.getElementById('cartSummaryBar');
      if (bar) bar.outerHTML = renderCartSummaryBar(radio.value).match(/<div id="cartSummaryBar"[\s\S]*<\/div>\s*$/)[0];
    });
  });
}

// ─── STEP 2: Review & Place Order ────────────────────────

function goToStep2() {
  // Validate fields
  const name = document.getElementById('shippingName').value.trim();
  const phone = document.getElementById('shippingPhone').value.trim();
  const addr = document.getElementById('shippingAddress1').value.trim();
  const city = document.getElementById('shippingCity').value.trim();
  const state = document.getElementById('shippingState').value.trim();
  const zip = document.getElementById('shippingZip').value.trim();
  const country = document.getElementById('shippingCountry').value.trim();
  const comments = document.getElementById('orderComments').value.trim();
  const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked').value;

  if (!name || !phone || !addr || !city || !state || !zip) {
    alert('Please fill in all required shipping fields.');
    return;
  }

  // Store for step 2
  window._checkoutData = { name, phone, addr, city, state, zip, country, shippingMethod, comments };

  renderStep2();
  window.scrollTo(0, 0);
}

function renderStep2() {
  const d = window._checkoutData;
  const container = document.getElementById('checkoutApp');
  const shipping = getShippingCost(d.shippingMethod);
  const subtotal = getSubtotal();
  const total = subtotal + shipping;

  container.innerHTML = `
    <div style="max-width:520px; margin:0 auto; padding:20px 16px 100px; font-family:Arial,sans-serif;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <h1 style="font-size:28px; font-weight:300; color:#333; margin:0;">Shipping</h1>
        <a href="#" onclick="renderStep1(); window.scrollTo(0,0); return false;" style="color:#3b82f6; text-decoration:none; font-size:14px;">Edit</a>
      </div>
      <div style="padding:12px 0; border-bottom:1px solid #eee; margin-bottom:24px; font-size:14px; color:#555; line-height:1.6;">
        ${d.name}<br>
        ${d.phone}<br>
        ${d.addr}<br>
        ${d.city}, ${d.state}, ${d.zip} / ${d.country}
        <div style="margin-top:8px; color:#333;">Ship by Order Total &nbsp; <strong>$${shipping.toFixed(2)}</strong></div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <h1 style="font-size:28px; font-weight:300; color:#333; margin:0;">Billing</h1>
        <a href="#" onclick="renderStep1(); window.scrollTo(0,0); return false;" style="color:#3b82f6; text-decoration:none; font-size:14px;">Edit</a>
      </div>
      <div style="padding:12px 0; border-bottom:1px solid #eee; margin-bottom:24px; font-size:14px; color:#555; line-height:1.6;">
        ${d.name}<br>
        ${d.phone}<br>
        ${d.addr}<br>
        ${d.city}, ${d.state}, ${d.zip} / ${d.country}
      </div>

      <h1 style="font-size:28px; font-weight:300; color:#333; margin:0 0 4px 0;">Payment</h1>
      <h3 style="color:#333; font-size:16px; margin:16px 0 12px;">Payment Methods</h3>
      <div style="border:1px solid #ddd; border-radius:8px; padding:16px; margin-bottom:24px;">
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:14px; font-weight:bold;">
          <input type="radio" name="paymentMethod" value="manual" checked style="width:18px; height:18px; accent-color:#3b82f6;">
          CLICK HERE TO PAY
        </label>
      </div>

      <div style="margin-bottom:24px;">
        <a href="#" onclick="return false;" style="color:#3b82f6; text-decoration:none; font-size:14px;">Coupon / gift certificate</a>
      </div>

      <button id="placeOrderBtn" onclick="placeOrder()" style="
        width:100%; padding:16px; background:#3b82f6; color:#fff; border:none; border-radius:8px;
        font-size:16px; font-weight:bold; cursor:pointer; letter-spacing:1px; text-transform:uppercase;
      ">PLACE ORDER</button>
    </div>
    ${renderCartSummaryBar(d.shippingMethod)}
  `;
}

// ─── Place Order ──────────────────────────────────────────

async function placeOrder() {
  const d = window._checkoutData;
  const btn = document.getElementById('placeOrderBtn');
  
  btn.disabled = true;
  btn.textContent = 'PLACING ORDER...';
  btn.style.opacity = '0.7';

  const orderPayload = {
    shipping_address: {
      address_line1: d.addr,
      city: d.city,
      state: d.state,
      postal_code: d.zip,
      country: d.country
    },
    shipping_method: d.shippingMethod,
    notes: d.comments || '',
    payment_method: 'manual'
  };

  try {
    const res = await api.orders.create(orderPayload);
    const order = res.data;
    
    // Redirect to order confirmation page
    window.location.href = `/order-confirmation.html?order_id=${order.id}`;
  } catch (err) {
    alert(err.message || 'Failed to place order. Please try again.');
    btn.disabled = false;
    btn.textContent = 'PLACE ORDER';
    btn.style.opacity = '1';
  }
}

// ─── Toggle cart details (stub) ──────────────────────────

window.toggleCartDetails = function() {
  alert('Cart Details:\n' + cartData.items.map(i => `${i.quantity}x ${i.product_name} - $${(i.quantity * parseFloat(i.price)).toFixed(2)}`).join('\n'));
};
