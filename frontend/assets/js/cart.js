document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

async function loadCart() {
  const container = document.querySelector('.CartContents');
  const cartFormContainer = document.getElementById('cartForm')?.parentElement;
  const emptyMessageContainer = document.querySelector('.InfoMessage.Message')?.parentElement;
  
  if (!container) return;

  try {
    const res = await api.cart.get();
    const cart = res.data;

    if (!cart || !cart.items || cart.items.length === 0) {
      if (cartFormContainer) cartFormContainer.style.display = 'none';
      if (emptyMessageContainer) emptyMessageContainer.style.display = 'block';
      
      const proceedBtn = document.querySelector('.ProceedToCheckout');
      const checkoutBtn = document.querySelector('.CheckoutButton');
      if (proceedBtn) proceedBtn.style.display = 'none';
      if (checkoutBtn) checkoutBtn.style.display = 'none';
      return;
    }

    if (cartFormContainer) cartFormContainer.style.display = 'block';
    if (emptyMessageContainer) emptyMessageContainer.style.display = 'none';
    
    const proceedBtn = document.querySelector('.ProceedToCheckout');
    const checkoutBtn = document.querySelector('.CheckoutButton');
    if (proceedBtn) proceedBtn.style.display = 'block';
    if (checkoutBtn) checkoutBtn.style.display = 'block';

    renderCartItems(cart);
  } catch (err) {
    console.error('Error loading cart:', err);
    container.innerHTML = '<p>There was an error loading your cart. Please try again later.</p>';
  }
}

function renderCartItems(cart) {
  const tbody = document.querySelector('.CartContents tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  let subtotal = 0;

  cart.items.forEach(item => {
    const itemTotal = item.quantity * parseFloat(item.price || 0);
    subtotal += itemTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="CartItemImage">
        <a href="product.html?slug=${item.product_slug || ''}">
          <img src="${item.image_url ? (item.image_url.startsWith('//') ? 'https:' + item.image_url : item.image_url) : '../cdn1.bigcommerce.com/n-yp39j5/2h44pn/product_images/uploaded_images/default.jpg'}" alt="${item.product_name || 'Product'}" style="max-width: 60px;">
        </a>
      </td>
      <td class="CartItemDetails">
        <strong><a href="product.html?slug=${item.product_slug || ''}">${item.product_name || 'Product'}</a></strong>
      </td>
      <td class="CartItemPrice">$${parseFloat(item.price || 0).toFixed(2)}</td>
      <td class="CartItemQuantity">
        <input type="number" min="1" value="${item.quantity}" style="width: 40px;" onchange="updateCartItem(${item.id}, this.value)">
      </td>
      <td class="CartItemTotal">$${itemTotal.toFixed(2)}</td>
      <td class="CartItemRemove">
        <a href="#" onclick="removeCartItem(${item.id}); return false;">Remove</a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Update Summary
  const subtotalEl = document.querySelector('.SubTotal td:last-child');
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  
  const grandTotalEl = document.querySelector('.GrandTotal td:last-child');
  if (grandTotalEl) grandTotalEl.textContent = `$${subtotal.toFixed(2)}`; // Without shipping/tax for now
}

window.updateCartItem = async function(itemId, qty) {
  try {
    await api.cart.updateItem(itemId, qty);
    loadCart();
    updateCartCount(); // In app.js
  } catch (err) {
    alert(err.message || 'Failed to update item');
  }
}

window.removeCartItem = async function(itemId) {
  try {
    await api.cart.removeItem(itemId);
    loadCart();
    updateCartCount(); // In app.js
  } catch (err) {
    alert(err.message || 'Failed to remove item');
  }
}
