const fs = require('fs');

let html = fs.readFileSync('checkout.html', 'utf8');

// The main container in the original theme is usually something like .BlockContent or .CartContents
// Let's replace the whole PageContent div or similar.
const replacement = `
<div class="Block Moveable Panel" id="CheckoutFormPanel">
  <h2>Checkout</h2>
  <div class="BlockContent">
    <div id="checkoutCartSummary" style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc;">
      <p>Loading summary...</p>
    </div>
    
    <form id="checkoutForm">
      <h3>Shipping Address</h3>
      <div style="margin-bottom: 10px;">
        <label>Address Line 1:</label><br/>
        <input type="text" name="address_line1" required style="width: 100%; max-width: 400px; padding: 5px;" />
      </div>
      <div style="margin-bottom: 10px;">
        <label>City:</label><br/>
        <input type="text" name="city" required style="padding: 5px;" />
      </div>
      <div style="margin-bottom: 10px;">
        <label>State:</label><br/>
        <input type="text" name="state" required style="padding: 5px;" />
      </div>
      <div style="margin-bottom: 10px;">
        <label>Postal Code:</label><br/>
        <input type="text" name="postal_code" required style="padding: 5px;" />
      </div>
      <div style="margin-bottom: 20px;">
        <label>Country:</label><br/>
        <input type="text" name="country" required style="padding: 5px;" value="US" />
      </div>
      
      <h3>Payment Method</h3>
      <div style="margin-bottom: 20px;">
        <select name="payment_method" required style="padding: 5px;">
          <option value="paystack">Credit Card (Paystack)</option>
          <option value="crypto">Cryptocurrency</option>
        </select>
      </div>
      
      <button type="submit" style="padding: 10px 20px; background-color: #3366ff; color: white; border: none; cursor: pointer; font-size: 16px;">Place Order</button>
    </form>
  </div>
</div>
`;

// Replace everything inside <div class="Content" id="LayoutColumn1"> or similar.
// In the original file, it was a cart. Let's just find <div class="Block Moveable Panel" id="CartContent"> and replace it until its closing div, or just replace the innerHTML of .CartContents.
// Since it's easier, we will just use regex to replace `<div class="CartContents">...</div>` or similar.
// Actually, let's just replace `<div class="Block Moveable Panel" id="CartContent">` to the end of the Block.
// To be safe, let's just replace `<div class="Content" id="LayoutColumn1">...</div></div>` entirely.
html = html.replace(/<div class="Content" id="LayoutColumn1">[\s\S]*?<br class="Clear" \/>\s*<\/div>/, `<div class="Content" id="LayoutColumn1">${replacement}<br class="Clear" /></div>`);

// Also change the injected script from cart.js to checkout.js
html = html.replace(/<script src="assets\/js\/cart\.js"><\/script>/, '<script src="assets/js/checkout.js"></script>');

fs.writeFileSync('checkout.html', html);
console.log('Checkout page updated.');
