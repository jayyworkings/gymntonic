const fs = require('fs');
['product.html', 'category.html'].forEach(f => {
  let txt = fs.readFileSync(f, 'utf8');

  // Only fix paths if not already fixed
  if (txt.includes('../../')) {
    txt = txt.replace(/\.\.\/\.\.\//g, '../');
  }

  // Only inject scripts if not already injected
  if (!txt.includes('api-client.js')) {
    if (f === 'product.html') {
      txt = txt.replace(/<\/body>/, '<script src="assets/js/api-client.js"></script><script src="assets/js/app.js"></script><script src="assets/js/product.js"></script></body>');
    } else {
      txt = txt.replace(/<\/body>/, '<script src="assets/js/api-client.js"></script><script src="assets/js/app.js"></script><script src="assets/js/category.js"></script></body>');
    }
  }

  fs.writeFileSync(f, txt);
});
console.log('Fixed paths and injected scripts (idempotent)');
