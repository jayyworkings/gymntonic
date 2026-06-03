document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  
  if (slug) {
    loadProduct(slug);
  }
});

async function loadProduct(slug) {
  try {
    const res = await api.products.getBySlug(slug);
    const product = res.data;
    
    // Update title and breadcrumb
    document.title = `${product.name} - GymNTonic`;
    const breadcrumb = document.querySelector('.Breadcrumb ul');
    if (breadcrumb) {
      breadcrumb.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="category.html?slug=${product.category?.slug || ''}">${product.category?.name || 'Category'}</a></li>
        <li>${product.name}</li>
      `;
    }
    
    // Update main product details
    const titleEl = document.querySelector('.ProductMain h1');
    if (titleEl) titleEl.textContent = product.name;
    
    const priceEl = document.querySelector('.ProductPrice');
    if (priceEl) {
      if (product.sale_price && product.sale_price < product.price) {
        priceEl.innerHTML = `<strike>$${product.price}</strike> $${product.sale_price}`;
      } else {
        priceEl.textContent = `$${product.price}`;
      }
    }
    
    // Update Description
    const descEl = document.querySelector('.ProductDescriptionContainer');
    if (descEl) {
      descEl.innerHTML = product.description || 'No description available.';
    }
    
    // Update Images
    if (product.images && product.images.length > 0) {
      let imageUrl = product.images[0].image_url;
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('../')) {
        imageUrl = `../cdn1.bigcommerce.com/n-yp39j5/2h44pn/products/${product.id}/images/${product.images[0].id}/${imageUrl}?c=2`;
      }
      
      const mainImg = document.querySelector('.ProductThumbImage img');
      if (mainImg) {
        mainImg.src = imageUrl;
        mainImg.alt = product.name;
      }
      
      const zoomLink = document.querySelector('.ProductThumbImage a');
      if (zoomLink) {
        zoomLink.href = imageUrl;
      }
    }
    
    // Wire up Add to Cart form
    const addToCartForm = document.getElementById('cartAddForm') || document.querySelector('form[action*="cart.php"]');
    if (addToCartForm) {
      // Prevent default form submission
      addToCartForm.onsubmit = async (e) => {
        e.preventDefault();
        const qtyInput = addToCartForm.querySelector('input[name="qty[]"]');
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        
        try {
          await api.cart.addItem(product.id, qty);
          updateCartCount(); // from app.js
          alert('Product added to cart!');
        } catch (err) {
          alert(err.message || 'Failed to add to cart');
        }
      };
    }
    
  } catch (err) {
    console.error('Error loading product:', err);
    const container = document.querySelector('.ProductMain');
    if (container) {
      container.innerHTML = '<h1>Product not found</h1>';
    }
  }
}
