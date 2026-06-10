// GymNTonic Main App File
document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the homepage by checking for HomeNewProducts
  const newProductsBlock = document.getElementById('HomeNewProducts');
  const featuredProductsBlock = document.getElementById('HomeFeaturedProducts');
  const popularProductsBlock = document.getElementById('SidePopularProducts');

  if (newProductsBlock || featuredProductsBlock || popularProductsBlock) {
    loadHomepageProducts();
  }
  
  updateAuthUI();
  updateCartCount();
  createCartModal();
  
  // Listen for auth state changes
  window.addEventListener('authStateChanged', updateAuthUI);
});

function updateAuthUI() {
  const topMenu = document.querySelector('.TopMenu ul');
  if (!topMenu) return;

  if (api.token) {
    // Logged in
    const loginLink = topMenu.querySelector('a[href*="login.html"]');
    if (loginLink) {
      loginLink.textContent = 'Logout';
      loginLink.href = '#';
      loginLink.onclick = (e) => {
        e.preventDefault();
        api.logout();
      };
    }
    
    // Add My Account if it doesn't exist
    if (!topMenu.querySelector('a[href*="account.html"]')) {
      const li = document.createElement('li');
      li.innerHTML = '<a href="/account.html">My Account</a>';
      topMenu.insertBefore(li, topMenu.children[1]);
    }
  }
}

async function updateCartCount() {
  try {
    const cart = await api.cart.get();
    const cartLink = document.querySelector('.TopMenu ul li.CartLink a span, .CartLink a span');
    if (cartLink && cart.data && cart.data.items) {
      const count = cart.data.items.reduce((sum, item) => sum + item.quantity, 0);
      cartLink.textContent = `${count} Items`;
    }
  } catch (err) {
    console.log('Cart fetch error', err);
  }
}

// =========================================================
// ADD-TO-CART MODAL
// =========================================================

function createCartModal() {
  // Inject the modal HTML into the page
  const modalHTML = `
    <div id="cartModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:10000; background:rgba(0,0,0,0.5);">
      <div id="cartModalInner" style="
        position:relative; 
        background:#fff; 
        max-width:550px; 
        margin:60px auto; 
        border-radius:6px; 
        box-shadow:0 4px 24px rgba(0,0,0,0.3); 
        overflow:hidden;
        max-height:80vh;
        overflow-y:auto;
        font-family:Arial,sans-serif;
      ">
        <a href="#" id="cartModalClose" style="
          position:absolute; top:10px; right:14px; font-size:18px; color:#888; text-decoration:none; z-index:2;
        ">Close &times;</a>
        <div style="padding:20px 24px;">
          <h2 style="font-size:18px; color:#333; margin:0 0 16px 0;">OK, <span id="cartModalQty">1</span> item was added to your cart. What next?</h2>
          <div style="display:flex; gap:14px; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap;">
            <img id="cartModalImg" src="" alt="" style="width:80px; height:80px; object-fit:contain; border:1px solid #eee; border-radius:4px;">
            <div style="flex:1; min-width:160px;">
              <p id="cartModalName" style="font-weight:bold; margin:0 0 4px 0; font-size:14px; color:#333;"></p>
              <p id="cartModalPrice" style="margin:0 0 4px 0; font-size:13px; color:#666;"></p>
              <p style="margin:0; font-size:13px; color:#666;">Quantity added: <span id="cartModalQtyAdded">1</span></p>
            </div>
            <div style="text-align:right; min-width:180px;">
              <a href="/checkout.html" style="
                display:inline-block; background:#e6007e; color:#fff; padding:8px 18px; text-decoration:none; border-radius:4px; font-size:13px; font-weight:bold; margin-bottom:8px;
              ">Proceed to checkout</a>
              <p style="margin:4px 0 0; font-size:13px;"><strong>Order Subtotal:</strong> <span id="cartModalSubtotal">$0.00</span></p>
              <p style="margin:2px 0 0; font-size:12px; color:#666;">Your cart contains <span id="cartModalItemCount">0</span> item(s)</p>
              <p style="margin:8px 0 0; font-size:13px;">
                <a href="#" id="cartModalContinue" style="color:#e6007e;">Continue Shopping</a> or
                <a href="/cart.html" style="color:#e6007e;">View or edit your cart</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Close handlers
  document.getElementById('cartModalClose').addEventListener('click', (e) => {
    e.preventDefault();
    closeCartModal();
  });
  document.getElementById('cartModalContinue').addEventListener('click', (e) => {
    e.preventDefault();
    closeCartModal();
  });
  document.getElementById('cartModal').addEventListener('click', (e) => {
    if (e.target.id === 'cartModal') closeCartModal();
  });
}

function closeCartModal() {
  const modal = document.getElementById('cartModal');
  if (modal) modal.style.display = 'none';
}

async function showCartModal(productName, productPrice, productImage, qtyAdded) {
  // Fetch latest cart data
  let cart;
  try {
    const res = await api.cart.get();
    cart = res.data;
  } catch (e) {
    cart = { items: [], total: '0.00', item_count: 0 };
  }

  const totalItems = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const subtotal = cart.items ? cart.items.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price || 0)), 0) : 0;

  document.getElementById('cartModalQty').textContent = qtyAdded;
  document.getElementById('cartModalQtyAdded').textContent = qtyAdded;
  document.getElementById('cartModalName').textContent = productName;
  document.getElementById('cartModalPrice').textContent = '$' + parseFloat(productPrice).toFixed(2);
  document.getElementById('cartModalSubtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('cartModalItemCount').textContent = totalItems;

  const imgEl = document.getElementById('cartModalImg');
  if (productImage) {
    let imgSrc = productImage;
    imgSrc = imgSrc.replace(/https?:\/\/(cdn\d+\.bigcommerce\.com)/g, '/$1');
    if (imgSrc.startsWith('//')) imgSrc = imgSrc.replace(/^\/\/(cdn\d+\.bigcommerce\.com)/g, '/$1');
    imgEl.src = imgSrc;
    imgEl.style.display = 'block';
  } else {
    imgEl.style.display = 'none';
  }

  document.getElementById('cartModal').style.display = 'block';
}

// =========================================================
// PRODUCT RENDERING
// =========================================================

function renderProductHTML(product) {
  // Try to find the image URL
  let imageUrl = '../cdn1.bigcommerce.com/n-yp39j5/2h44pn/product_images/uploaded_images/default.jpg';
  if (product.images && product.images.length > 0) {
    imageUrl = product.images[0].image_url;
  }
  
  // Clean up protocol-relative URLs
  if (imageUrl.startsWith('//')) {
    imageUrl = 'https:' + imageUrl;
  } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('../')) {
    imageUrl = `../cdn1.bigcommerce.com/n-yp39j5/2h44pn/products/${product.id}/images/${product.images[0]?.id || 1}/${imageUrl}?c=2`;
  }
  
  const ratingStars = Math.min(5, Math.max(0, Math.round(product.rating || 0)));
  const productUrl = `/product.html?slug=${product.slug}`;

  let priceHtml = `<em>$${product.price}</em>`;
  if (product.sale_price && product.sale_price < product.price) {
    priceHtml = `<em><strike class="RetailPriceValue">$${product.price}</strike> $${product.sale_price}</em>`;
  }

  return `
    <div class="ProductImage QuickView" data-product="${product.id}">
      <a href="${productUrl}">
        <img src="${imageUrl}" alt="${product.name}" />
      </a>
    </div>
    <div class="ProductDetails">
      <strong><a href="${productUrl}">${product.name}</a></strong>
    </div>
    <div class="ProductPriceRating">
      ${priceHtml}
      <span class="Rating Rating${ratingStars}">
        <img src="../cdn10.bigcommerce.com/r-ed4df9f0c7d32e85e8725e648dac0f8faffad0ff/themes/CosmeticStuff/images/IcoRating${ratingStars}.gif" alt="" />
      </span>
    </div>
    <div class="ProductActionAdd" style="display:;">
      <a href="#" onclick="addToCart(${product.id}); return false;">Add To Cart</a>
    </div>
  `;
}

// =========================================================
// ADD TO CART FUNCTIONS
// =========================================================

// Get product info from the current product page DOM
function getProductInfoFromPage() {
  const name = document.querySelector('.ProductMain h1, .ProductMain h2, [itemprop="name"]');
  const price = document.querySelector('.ProductPrice em, .ProductMain .ProductPrice, .CurrentlySelling .ProductPrice em');
  
  // Try to get the main product image
  let image = null;
  const mainImg = document.querySelector('.ProductThumbImage img, .ProductMain .ProductImage img, #ProductDetails .ProductImage img');
  if (mainImg) image = mainImg.src;

  return {
    name: name ? name.textContent.trim() : 'Product',
    price: price ? price.textContent.replace(/[^0-9.]/g, '') : '0.00',
    image: image
  };
}

window.addToCart = async function(productId) {
  try {
    const slug = extractSlugFromUrl(window.location.pathname);
    const qtyInput = document.querySelector('input[name="qty[]"], input[name="qty"]');
    const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

    await api.cart.addItem(productId, qty, null, slug);
    updateCartCount();

    // Get product info for modal
    const info = getProductInfoFromPage();
    showCartModal(info.name, info.price, info.image, qty);
  } catch (err) {
    alert(err.message || 'Failed to add to cart');
  }
}

// Helper to extract product slug from a URL path
function extractSlugFromUrl(urlPath) {
  const parts = urlPath.replace(/\/index\.html$/i, '').split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

// =========================================================
// HOMEPAGE PRODUCTS
// =========================================================

async function loadHomepageProducts() {
  try {
    const res = await api.products.getAll({ limit: 12, sort: 'created_at', order: 'desc' });
    const products = res.data.products;
    
    const newProducts = products.slice(0, 4);
    const featuredProducts = products.slice(4, 8);
    const popularProducts = products.slice(8, 12);
    
    populateSection('HomeNewProducts', newProducts);
    populateSection('HomeFeaturedProducts', featuredProducts);
    populateSection('SidePopularProducts', popularProducts);
  } catch (error) {
    console.error('Failed to load homepage products:', error);
  }
}

function populateSection(sectionId, products) {
  const block = document.getElementById(sectionId);
  if (!block) return;
  
  const ul = block.querySelector('ul.ProductList');
  if (!ul) return;
  
  ul.innerHTML = '';
  
  products.forEach((product, index) => {
    const li = document.createElement('li');
    li.className = index % 2 === 0 ? 'Odd' : 'Even';
    li.innerHTML = renderProductHTML(product);
    ul.appendChild(li);
  });
}

// =========================================================
// LEGACY BIGCOMMERCE OVERRIDES
// =========================================================

window.fastCartAction = async function(url) {
  try {
    const a = document.createElement('a');
    a.href = url;
    const urlObj = new URL(a.href);
    const productId = urlObj.searchParams.get('product_id');
    
    if (!productId) {
       console.error('No product id in fast cart url:', url);
       return;
    }
    
    const slug = extractSlugFromUrl(window.location.pathname);
    
    if (window.$ && $('#AjaxLoading').length) {
      $('#AjaxLoading').show();
    }
    
    await api.cart.addItem(productId, 1, null, slug);
    updateCartCount();
    
    if (window.$ && $('#AjaxLoading').length) {
      $('#AjaxLoading').hide();
    }

    // Try to get the product name/price/image from the clicked item's parent
    let name = 'Product', price = '0.00', image = null;
    // Look for the product details in the sidebar or product list
    const productLinks = document.querySelectorAll('.ProductList li');
    for (const li of productLinks) {
      const addLink = li.querySelector(`.ProductActionAdd a[href*="product_id=${productId}"]`);
      if (addLink) {
        const nameEl = li.querySelector('.ProductDetails a');
        const priceEl = li.querySelector('.ProductPriceRating em');
        const imgEl = li.querySelector('.ProductImage img');
        if (nameEl) name = nameEl.textContent.trim();
        if (priceEl) price = priceEl.textContent.replace(/[^0-9.]/g, '');
        if (imgEl) image = imgEl.src;
        break;
      }
    }
    showCartModal(name, price, image, 1);
  } catch (err) {
    if (window.$ && $('#AjaxLoading').length) {
      $('#AjaxLoading').hide();
    }
    alert(err.message || 'Failed to add to cart');
  }
};

window.check_add_to_cart = function(form, is_fast_cart) {
  const qtyInput = form.elements['qty[]'] || form.elements['qty'];
  const productIdInput = form.elements['product_id'];
  
  const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
  const productId = productIdInput ? productIdInput.value : null;
  const slug = extractSlugFromUrl(window.location.pathname);
  
  if (productId || slug) {
    if (window.$ && $('#AjaxLoading').length) {
      $('#AjaxLoading').show();
    }
    api.cart.addItem(productId, qty, null, slug)
      .then(() => {
        updateCartCount();
        if (window.$ && $('#AjaxLoading').length) {
          $('#AjaxLoading').hide();
        }
        const info = getProductInfoFromPage();
        showCartModal(info.name, info.price, info.image, qty);
      })
      .catch((err) => {
        if (window.$ && $('#AjaxLoading').length) {
          $('#AjaxLoading').hide();
        }
        alert(err.message || 'Failed to add to cart');
      });
  }
  
  return false; // Prevent default form submission
};
