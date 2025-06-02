const fs = require('fs');
const path = require('path');

function fixFileContent(filePath, basePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // HTMLファイルの処理
    if (path.extname(filePath).toLowerCase() === '.html') {
      // "../_next/" を "./_next/" に置換
      content = content.replace(/href="\.\.\/_next\//g, 'href="./_next/');
      content = content.replace(/src="\.\.\/_next\//g, 'src="./_next/');
      
      // "/_next/" を "./_next/" に置換
      content = content.replace(/href="\/_next\//g, 'href="./_next/');
      content = content.replace(/src="\/_next\//g, 'src="./_next/');
      
      // JavaScriptコード内での置換（文字列リテラル内）
      content = content.replace(/"\.\.\/_next\//g, '"./_next/');
      content = content.replace(/'\.\.\/_next\//g, "'./_next/");
    }
    
    // JSファイルとCSSファイルの処理
    if (path.extname(filePath).toLowerCase() === '.js' || path.extname(filePath).toLowerCase() === '.css') {
      content = content.replace(/\/_next\//g, './_next/');
      content = content.replace(/"\/_next\//g, '"./_next/');
      content = content.replace(/'\/_next\//g, "'./_next/");
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed paths in:', path.relative(basePath, filePath));
    }
  } catch (error) {
    console.error('Error fixing file', filePath, ':', error.message);
  }
}

function fixPathsRecursively(dirPath, basePath) {
  console.log('Processing directory:', dirPath);
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        fixPathsRecursively(itemPath, basePath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (ext === '.js' || ext === '.css' || ext === '.html') {
          fixFileContent(itemPath, basePath);
        }
      }
    }
  } catch (error) {
    console.error('Error processing directory', dirPath, ':', error.message);
  }
}

function fixPaths() {
  const outDir = path.join(__dirname, 'out');
  
  console.log('=== Enhanced Path Fixing Process ===');
  console.log('Target directory:', outDir);
  
  if (!fs.existsSync(outDir)) {
    console.error('ERROR: out directory not found at', outDir);
    return;
  }
  
  // すべてのファイルを再帰的に処理
  console.log('Processing all files recursively...');
  fixPathsRecursively(outDir, outDir);
  
  console.log('=== Path fixing completed successfully ===');
}

try {
  fixPaths();
} catch (error) {
  console.error('=== Path fixing failed ===');
  console.error('Error:', error.message);
  process.exit(1);
}