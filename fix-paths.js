const fs = require('fs');
const path = require('path');

function fixPaths() {
  const htmlFile = path.join(__dirname, 'out', 'index.html');
  
  if (!fs.existsSync(htmlFile)) {
    console.log('index.html not found');
    return;
  }
  
  let content = fs.readFileSync(htmlFile, 'utf8');
  console.log('Original content length:', content.length);
  
  // 正しいパス修正：/_next/ を ./_next/ に変換
  console.log('Before replacement sample:', content.substring(0, 200));
  
  // /_next/ を ./_next/ に置換
  content = content.replace(/\/_next\//g, './_next/');
  
  console.log('After replacement sample:', content.substring(0, 200));
  
  // 置換回数を数える
  const matches = content.match(/\/_next\//g);
  if (matches) {
    console.log(`${matches.length} instances of /_next/ found and replaced`);
  } else {
    console.log('No /_next/ patterns found');
  }
  
  fs.writeFileSync(htmlFile, content);
  console.log('Fixed paths in index.html');
}

fixPaths(); 