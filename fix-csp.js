const fs = require('fs');
const path = require('path');

// index.htmlファイルを読み込み
const indexPath = path.join(__dirname, 'out', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// CSPメタタグを追加（既に存在しない場合）
if (!html.includes('http-equiv="Content-Security-Policy"')) {
  const cspMeta = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\';">';
  html = html.replace('<head>', `<head>\n${cspMeta}`);
}

// ファイルに書き戻し
fs.writeFileSync(indexPath, html);
console.log('CSP headers fixed in index.html'); 