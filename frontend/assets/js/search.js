document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('search_query');
  
  const searchInput = document.getElementById('search_query');
  if (searchInput && query) {
    searchInput.value = query;
  }
  
  if (query) {
    performSearch(query);
  }
});

async function performSearch(query) {
  const container = document.querySelector('.SearchContainer');
  if (!container) return;

  try {
    const res = await api.search.products(query);
    const products = res.data.products;

    let html = `<h2>Search Results for "${query}"</h2>`;
    
    if (!products || products.length === 0) {
      html += '<p>No products found matching your search.</p>';
      container.innerHTML = html;
      return;
    }

    html += '<ul class="ProductList">';
    products.forEach((product, index) => {
      const liClass = index % 2 === 0 ? 'Odd' : 'Even';
      html += `<li class="${liClass}">${renderProductHTML(product)}</li>`;
    });
    html += '</ul>';
    
    container.innerHTML = html;
  } catch (err) {
    console.error('Search error:', err);
    container.innerHTML = `<p>Error performing search: ${err.message}</p>`;
  }
}

// Attach generic search form handlers for the search box in the header
const searchForm = document.querySelector('form[action*="search.php"]');
if (searchForm) {
  searchForm.onsubmit = (e) => {
    e.preventDefault();
    const query = searchForm.querySelector('input[name="search_query"]').value;
    window.location.href = `/search.html?search_query=${encodeURIComponent(query)}`;
  };
}
