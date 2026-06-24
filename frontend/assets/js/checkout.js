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

// ─── Payment Method Icons (inline SVGs) ───────────────────

function getPaymentIcon(method) {
  const icons = {
    'Crypto': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f7931a" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.5 8h3c1.1 0 2 .9 2 2s-.9 2-2 2H9.5m0-4v4m0 0h3.5c1.1 0 2 .9 2 2s-.9 2-2 2H9.5m0-4v4M12 6v2m0 8v2"/></svg>',
    'Cashapp': '<svg width="22" height="22" viewBox="0 0 24 24" fill="#00d632"><rect width="24" height="24" rx="5" fill="#00d632"/><path d="M15.5 8.5l-1.2-1.2c-.8-.8-2.1-.8-2.9 0L8.5 10.2c-.8.8-.8 2.1 0 2.9l1.2 1.2m4.1-4.1l1.2 1.2c.8.8.8 2.1 0 2.9l-2.9 2.9c-.8.8-2.1.8-2.9 0L8 16" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
    'Zelle': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#6d1ed4"/><path d="M7 8h10L7 16h10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'Venmo': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#3d95ce"/><path d="M15.5 6c.5.8.7 1.7.7 2.7 0 3.3-2.8 7.6-5.1 10.3H7L5.5 7.5l3.3-.3.8 6.8c.8-1.3 1.7-3.3 1.7-4.7 0-1-.2-1.6-.4-2.1L15.5 6z" fill="#fff"/></svg>',
    'PayPal': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#003087"/><path d="M8.5 19l.5-3h2c3 0 5-2 5.5-5 .3-1.5-.5-3-3-3h-4L7 18" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M10 14l.5-3h2c2.5 0 4-1.5 4.3-3.5.2-1.2-.4-2.5-2.5-2.5h-3.5L9 14" stroke="#009cde" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
    'Bank Payment': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>'
  };
  return icons[method] || '';
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

  // Payment methods array
  const paymentMethods = ['Crypto', 'Cashapp', 'Zelle', 'Venmo', 'PayPal', 'Bank Payment'];

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
      <h3 style="color:#333; font-size:16px; margin:16px 0 12px;">Select Payment Method</h3>
      
      <!-- ============================================================ -->
      <!-- CONDITIONAL STATE BLOCK BEGINS                                -->
      <!-- ============================================================ -->
      <div id="paymentMethodsGroup" style="border:1px solid #ddd; border-radius:12px; overflow:hidden; margin-bottom:24px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        
        <!-- Payment Option Radio Buttons -->
        <div style="display:flex; flex-direction:column;">
          ${paymentMethods.map((method, idx) => `
            <label id="pmLabel_${idx}" style="
              display:flex; align-items:center; gap:12px; cursor:pointer; 
              padding:14px 18px; font-size:14px; font-weight:600; color:#333;
              border-bottom:1px solid #f0f0f0;
              background:${idx === 0 ? '#f0f7ff' : '#fff'};
              transition: background 0.2s ease;
            " onmouseover="this.style.background=this.querySelector('input').checked?'#f0f7ff':'#fafafa'" 
              onmouseout="this.style.background=this.querySelector('input').checked?'#f0f7ff':'#fff'">
              <input type="radio" name="paymentMethod" value="${method}" ${idx === 0 ? 'checked' : ''} 
                style="width:18px; height:18px; accent-color:#3b82f6; flex-shrink:0;" 
                onchange="handlePaymentMethodChange(this.value)">
              <span style="display:flex; align-items:center; gap:8px;">
                ${getPaymentIcon(method)}
                ${method}
              </span>
            </label>
          `).join('')}
        </div>

        <!-- Conditional Payment Details Area -->
        <div id="paymentDetailsContainer" style="padding:20px 18px; background:#fafafa; border-top:2px solid #3b82f6;">

          <!-- ========== CRYPTO VIEW ========== -->
          <div id="cryptoView" style="display:block;">
            <div style="background:#1a1a1a; color:#fff; border-radius:16px; padding:24px; max-width:400px; margin:0 auto; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              
              <!-- Warning Banner -->
              <div style="background:linear-gradient(135deg, #4a3f1c, #3d3516); color:#e5c158; padding:14px 16px; border-radius:10px; display:flex; gap:10px; align-items:flex-start; margin-bottom:22px; font-size:13px; line-height:1.5; border:1px solid #5a4f2c;">
                <span style="font-size:18px; flex-shrink:0; margin-top:1px;">⚠️</span>
                <span><strong>Warning:</strong> Only send Tether USDT (TRC20) assets to this address. Other assets will be lost forever.</span>
              </div>
              
              <!-- Asset Badge -->
              <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:22px;">
                <span style="background:#26a17b; color:#fff; padding:5px 12px; border-radius:6px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:6px; letter-spacing:0.5px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="10" fill="#26a17b" stroke="#fff" stroke-width="1"/><path d="M13 6v2h3v2h-8v-2h3V6h2zm-1 6c-3.3 0-6-.7-6-1.5h2c.5.3 2 .5 4 .5s3.5-.2 4-.5h2c0 .8-2.7 1.5-6 1.5zm0 2c2 0 3.8-.2 5-.6v1.2c-1.2.4-3 .6-5 .6s-3.8-.2-5-.6v-1.2c1.2.4 3 .6 5 .6zm0 2c2 0 3.8-.2 5-.6v1.2c-1.2.4-3 .6-5 .6s-3.8-.2-5-.6v-1.2c1.2.4 3 .6 5 .6z" fill="#fff"/></svg>
                  USDT
                </span>
                <span style="background:#333; color:#aaa; padding:5px 12px; border-radius:6px; font-size:13px; font-weight:500; border:1px solid #444;">Tron (TRC20)</span>
              </div>

              <!-- QR Code + Address Card -->
              <div style="background:#fff; border-radius:14px; padding:24px 20px; text-align:center; margin-bottom:22px; box-shadow:0 2px 12px rgba(0,0,0,0.15);">
                <!-- QR Code via API -->
                <img id="walletQRCode" 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TXkcgno6ARTtL5dBd93BJS3xHXCdPh5U55&margin=8" 
                  alt="USDT TRC20 Wallet QR Code" 
                  style="width:200px; height:200px; margin:0 auto 18px; display:block; border-radius:8px; border:1px solid #eee;"
                  onerror="this.style.display='none'; document.getElementById('qrFallback').style.display='flex';">
                <!-- Fallback if QR API fails -->
                <div id="qrFallback" style="width:200px; height:200px; border:2px dashed #ccc; border-radius:8px; margin:0 auto 18px; display:none; align-items:center; justify-content:center; color:#888; background:#f9f9f9; font-size:13px;">
                  QR Code
                </div>

                <div id="walletAddress" style="font-family:'SF Mono', 'Fira Code', 'Consolas', monospace; font-size:14px; color:#1a1a1a; word-break:break-all; margin-bottom:10px; padding:10px 12px; background:#f5f5f5; border-radius:8px; border:1px solid #e5e5e5; letter-spacing:0.3px; font-weight:600; user-select:all;">TXkcgno6ARTtL5dBd93BJS3xHXCdPh5U55</div>
                <div style="font-size:12px; color:#888; font-weight:500;">No memo required</div>
              </div>

              <!-- Utility Buttons -->
              <div style="display:flex; justify-content:center; gap:32px; align-items:center; padding-bottom:22px; margin-bottom:22px; border-bottom:1px solid #333;">
                <div id="copyBtnWrap" style="display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:transform 0.15s ease;" 
                  onclick="copyWalletAddress()" 
                  onmouseover="this.style.transform='scale(1.08)'" 
                  onmouseout="this.style.transform='scale(1)'">
                  <div style="width:44px; height:44px; background:#2a2a2a; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid #444; transition:background 0.2s;">
                    <span id="copyIcon" style="font-size:18px;">📋</span>
                  </div>
                  <span id="copyLabel" style="font-size:12px; color:#ccc; font-weight:500;">Copy</span>
                </div>
              </div>

              <!-- Deposit from Exchange -->
              <div style="background:#2a2a2a; border-radius:12px; padding:16px 18px; display:flex; align-items:center; gap:14px; border:1px solid #333;">
                <div style="width:36px; height:36px; background:linear-gradient(135deg, #26a17b, #1a8f6a); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px; flex-shrink:0;">↓</div>
                <div style="display:flex; flex-direction:column;">
                  <span style="font-size:14px; color:#fff; font-weight:600;">Deposit from exchange</span>
                  <span style="font-size:12px; color:#888; margin-top:2px;">By direct transfer from your account</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ========== OTHER PAYMENT VIEW ========== -->
          <div id="otherPaymentView" style="display:none;">
            <div style="background:#fff; border-radius:12px; padding:24px; border:1px solid #e5e7eb; box-shadow:0 1px 4px rgba(0,0,0,0.06);">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f0f0f0;">
                <div style="width:36px; height:36px; background:linear-gradient(135deg, #3b82f6, #2563eb); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px; flex-shrink:0;">✉</div>
                <div>
                  <strong style="font-size:15px; color:#333;">Manual Payment Required</strong>
                  <p style="margin:2px 0 0; font-size:12px; color:#888;">Follow the instructions below</p>
                </div>
              </div>
              <p style="margin:0 0 12px; font-size:14px; color:#4b5563; line-height:1.6;">
                ORDERS MUST be paid immediately. All unpaid orders are cancelled after 24 hours. 
                Please put the <strong>ORDER NUMBER</strong> in the notes and NOTHING ELSE.
              </p>
              <p style="margin:0 0 12px; font-size:14px; color:#333; font-weight:600;">
                Contact support email for payment info and instructions:
              </p>
              <a href="mailto:sales@storesgymntonic.com" style="
                display:inline-block; font-size:17px; font-weight:700; color:#3b82f6; text-decoration:none;
                padding:8px 16px; background:#eff6ff; border-radius:8px; border:1px solid #bfdbfe;
              ">sales@storesgymntonic.com</a>
              <p style="margin:14px 0 0; font-size:13px; color:#6b7280; line-height:1.5;">
                Send funds and screenshot the payment you send. EMAIL us the screenshot. 
                If you do not send a screenshot we will not ship the order.
              </p>
            </div>
          </div>

        </div>
      </div>
      <!-- ============================================================ -->
      <!-- CONDITIONAL STATE BLOCK ENDS                                  -->
      <!-- ============================================================ -->

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

  // Get selected payment method
  const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'manual';

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
    payment_method: paymentMethod
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

// ─── Payment Methods Logic ────────────────────────────────

window.handlePaymentMethodChange = function(method) {
  const cryptoView = document.getElementById('cryptoView');
  const otherView = document.getElementById('otherPaymentView');
  
  if (method === 'Crypto') {
    cryptoView.style.display = 'block';
    otherView.style.display = 'none';
  } else {
    cryptoView.style.display = 'none';
    otherView.style.display = 'block';
  }

  // Update radio label highlights
  const allLabels = document.querySelectorAll('#paymentMethodsGroup label[id^="pmLabel_"]');
  allLabels.forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if (radio && radio.checked) {
      label.style.background = '#f0f7ff';
    } else {
      label.style.background = '#fff';
    }
  });
};

// ─── Copy Wallet Address (with fallback) ──────────────────

window.copyWalletAddress = function() {
  const address = 'TXkcgno6ARTtL5dBd93BJS3xHXCdPh5U55';

  function onCopySuccess() {
    const copyLabel = document.getElementById('copyLabel');
    const copyIcon = document.getElementById('copyIcon');
    
    copyLabel.textContent = 'Copied!';
    copyLabel.style.color = '#26a17b';
    copyIcon.textContent = '✅';
    
    setTimeout(() => {
      copyLabel.textContent = 'Copy';
      copyLabel.style.color = '#ccc';
      copyIcon.textContent = '📋';
    }, 2500);
  }

  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(address).then(onCopySuccess).catch(() => {
      // Fallback for non-HTTPS or permission denied
      fallbackCopy(address, onCopySuccess);
    });
  } else {
    // Fallback for older browsers
    fallbackCopy(address, onCopySuccess);
  }
};

function fallbackCopy(text, onSuccess) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    onSuccess();
  } catch (err) {
    alert('Wallet address: ' + text);
  }
  document.body.removeChild(textarea);
}
