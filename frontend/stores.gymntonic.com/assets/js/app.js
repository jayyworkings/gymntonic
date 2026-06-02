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
    // If it's just a filename, assume it's relative to where images are
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

window.addToCart = async function(productId) {
  try {
    await api.cart.addItem(productId, 1);
    updateCartCount();
    alert('Product added to cart!');
  } catch (err) {
    alert(err.message || 'Failed to add to cart');
  }
}

async function loadHomepageProducts() {
  try {
    const res = await api.products.getAll({ limit: 12, sort: 'created_at', order: 'desc' });
    const products = res.data.products;
    
    // Divide products among the 3 sections randomly for now just to populate them
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
  
  ul.innerHTML = ''; // Clear existing static products
  
  products.forEach((product, index) => {
    const li = document.createElement('li');
    li.className = index % 2 === 0 ? 'Odd' : 'Even';
    li.innerHTML = renderProductHTML(product);
    ul.appendChild(li);
  });
}
