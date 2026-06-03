document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  
  if (slug) {
    loadCategory(slug);
  }
});

async function loadCategory(slug) {
  try {
    const res = await api.categories.getBySlug(slug);
    const category = res.data;
    
    // Update title and breadcrumb
    document.title = `${category.name} - GymNTonic`;
    const titleEl = document.querySelector('.CategoryContent h2');
    if (titleEl) titleEl.textContent = category.name;
    
    const breadcrumb = document.querySelector('.Breadcrumb ul');
    if (breadcrumb) {
      breadcrumb.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li>${category.name}</li>
      `;
    }
    
    // Fetch products for this category
    const productsRes = await api.products.getAll({ category: category.id, limit: 100 });
    const products = productsRes.data.products;
    
    renderCategoryProducts(products);
    
  } catch (err) {
    console.error('Error loading category:', err);
    const container = document.querySelector('.CategoryContent');
    if (container) {
      container.innerHTML = '<h2>Category not found</h2>';
    }
  }
}

function renderCategoryProducts(products) {
  const ul = document.querySelector('.CategoryContent ul.ProductList');
  if (!ul) return;
  
  if (products.length === 0) {
    ul.innerHTML = '<li>No products found in this category.</li>';
    return;
  }
  
  ul.innerHTML = '';
  
  products.forEach((product, index) => {
    const li = document.createElement('li');
    li.className = index % 2 === 0 ? 'Odd' : 'Even';
    li.innerHTML = renderProductHTML(product); // Assuming renderProductHTML is available globally from app.js
    ul.appendChild(li);
  });
}
