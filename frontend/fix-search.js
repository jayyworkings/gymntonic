const fs = require('fs');
let txt = fs.readFileSync('search.html', 'utf8');
if (!txt.includes('api-client.js')) {
  txt = txt.replace(/<\/body>/, '<script src="assets/js/api-client.js"></script><script src="assets/js/app.js"></script><script src="assets/js/search.js"></script></body>');
  
  // Clear the search container so search.js can populate it
  txt = txt.replace(/<div class="SearchContainer">[\s\S]*?<\/div>/, '<div class="SearchContainer">Loading search...</div>');
  
  fs.writeFileSync('search.html', txt);
  console.log('Search injected');
}
