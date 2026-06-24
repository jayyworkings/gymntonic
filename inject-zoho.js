const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allHtmlFiles = walk('c:/Users/HP/Desktop/PRojs/gymntonics/frontend');
let count = 0;
const zohoSnippet = `<script>window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}</script><script id="zsiqscript" src="https://salesiq.zohopublic.com/widget?wc=siq3874be971127b440cb957fb346bba3c6b5970b399a766e056cacf349b46ba780" defer></script>`;

allHtmlFiles.forEach(f => {
  let txt = fs.readFileSync(f, 'utf8');
  if (!txt.includes('zsiqscript')) {
    if (txt.match(/<\/body>/i)) {
        txt = txt.replace(/<\/body>/i, `${zohoSnippet}\n</body>`);
        fs.writeFileSync(f, txt);
        count++;
    }
  }
});

console.log(`Injected Zoho scripts into ${count} HTML files.`);
