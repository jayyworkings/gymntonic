const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir('./frontend', (filePath) => {
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Add cache buster to scripts. We use v=3 to be absolutely sure.
    if (content.includes('api-client.js"')) {
      content = content.replace(/api-client\.js"/g, 'api-client.js?v=3"');
      changed = true;
    }
    if (content.includes('app.js"')) {
      content = content.replace(/app\.js"/g, 'app.js?v=3"');
      changed = true;
    }
    if (content.includes('login.js"')) {
      content = content.replace(/login\.js"/g, 'login.js?v=3"');
      changed = true;
    }
    // Also fix already appended v=2 if we ran it successfully on some files
    if (content.includes('api-client.js?v=2"')) {
      content = content.replace(/api-client\.js\?v=2"/g, 'api-client.js?v=3"');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      count++;
    }
  }
});
console.log('Updated ' + count + ' files with cache buster.');
