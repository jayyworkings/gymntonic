const fs = require('fs');

let html = fs.readFileSync('payment.html', 'utf8');

const replacement = `
<div class="Block Moveable Panel" id="PaymentFormPanel">
  <h2>Processing Payment...</h2>
  <div class="BlockContent">
    <p>Please wait while we initialize your secure payment session.</p>
  </div>
</div>
`;

// Replace the CheckoutFormPanel from checkout.html with PaymentFormPanel
html = html.replace(/<div class="Block Moveable Panel" id="CheckoutFormPanel">[\s\S]*?<\/div>\s*<\/div>/, replacement);

// Replace checkout.js with payment.js
html = html.replace(/<script src="assets\/js\/checkout\.js"><\/script>/, '<script src="assets/js/payment.js"></script>');

fs.writeFileSync('payment.html', html);
console.log('Payment page updated.');
