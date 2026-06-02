const fs = require('fs');

['cart.html', 'login.html', 'logind85d.html'].forEach(f => {
  if (fs.existsSync(f)) {
    let txt = fs.readFileSync(f, 'utf8');
    
    // Check if we already injected
    if (!txt.includes('api-client.js')) {
      const scriptName = f.includes('cart') ? 'cart.js' : 'login.js';
      txt = txt.replace(/<\/body>/, `<script src="assets/js/api-client.js"></script><script src="assets/js/app.js"></script><script src="assets/js/${scriptName}"></script></body>`);
      fs.writeFileSync(f, txt);
      console.log(`Injected into ${f}`);
    } else {
      console.log(`Already injected in ${f}`);
    }
  }
});
