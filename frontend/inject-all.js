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

const allHtmlFiles = walk('c:/Users/HP/Desktop/gymntonics/frontend');
let count = 0;
allHtmlFiles.forEach(f => {
  let txt = fs.readFileSync(f, 'utf8');
  if (!txt.includes('app.js')) {
    const relativePath = f.replace(/\\/g, '/').split('frontend/')[1];
    const depth = relativePath.split('/').length - 1;
    const prefix = depth === 0 ? '' : '../'.repeat(depth);
    const scripts = `<script src="${prefix}assets/js/api-client.js"></script><script src="${prefix}assets/js/app.js"></script>`;
    if (txt.match(/<\/body>/i)) {
        txt = txt.replace(/<\/body>/i, `${scripts}</body>`);
        fs.writeFileSync(f, txt);
        count++;
    }
  }
});

console.log(`Injected scripts into ${count} HTML files.`);
