const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPIをrendererプロセスに公開
contextBridge.exposeInMainWorld('electronAPI', {
  // アプリケーション情報
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,
  
  // 将来的なファイル操作やデータベース連携用のAPI
  // 現在はNext.jsアプリケーション内でデータベース操作を行うため、ここではプレースホルダー
  ready: () => {
    console.log('Electron API Ready');
  }
});

// ウィンドウの準備完了を通知
window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron preload script loaded');
}); 