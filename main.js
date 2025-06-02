const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  // メインウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'myadmin_icon.png'),
    show: false, // ウィンドウの準備ができてから表示
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // 本番環境では静的ファイル、開発環境ではdev serverを読み込み
  let url;
  if (isDev) {
    url = 'http://localhost:3000';
  } else {
    // パッケージ化されている場合のパス解決
    url = `file://${path.join(__dirname, 'out', 'index.html')}`;
  }

  console.log('=== Diagnostic Information ===');
  console.log('Loading URL:', url);
  console.log('isDev:', isDev);
  console.log('app.isPackaged:', app.isPackaged);
  console.log('__dirname:', __dirname);
  console.log('Current working directory:', process.cwd());
  console.log('Node version:', process.version);
  console.log('Electron version:', process.versions.electron);
  
  // ファイルの存在確認
  if (!isDev) {
    const fs = require('fs');
    const targetFile = path.join(__dirname, 'out', 'index.html');
    console.log('Target file path:', targetFile);
    console.log('Target file exists:', fs.existsSync(targetFile));
    
    if (fs.existsSync(targetFile)) {
      const stats = fs.statSync(targetFile);
      console.log('File size:', stats.size, 'bytes');
      console.log('File modified:', stats.mtime);
    }
  }
  
  console.log('=== Loading URL ===');
  mainWindow.loadURL(url).then(() => {
    console.log('URL loaded successfully');
  }).catch(err => {
    console.error('Failed to load URL:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  });

  // 強化されたWebContentsエラーハンドリング
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    console.error('=== PAGE LOAD FAILED ===');
    console.error('Error details:', {
      errorCode,
      errorDescription,
      validatedURL,
      isMainFrame,
      timestamp: new Date().toISOString()
    });
    
    // 特定のエラーコードに対する詳細情報
    if (errorCode === -6) {
      console.error('FILE_NOT_FOUND: The requested file was not found');
    } else if (errorCode === -105) {
      console.error('NAME_NOT_RESOLVED: DNS resolution failed');
    }
  });

  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('=== WEBCONTENTS CRASHED ===');
    console.error('Killed:', killed);
    console.error('Timestamp:', new Date().toISOString());
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.error('=== WEBCONTENTS UNRESPONSIVE ===');
    console.error('Timestamp:', new Date().toISOString());
  });

  mainWindow.webContents.on('responsive', () => {
    console.log('=== WEBCONTENTS RESPONSIVE AGAIN ===');
  });

  // 詳細なコンソールメッセージログ
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const logLevel = ['verbose', 'info', 'warning', 'error'][level] || 'unknown';
    console.log(`[WebContents-${logLevel.toUpperCase()}] ${message} (${sourceId}:${line})`);
  });

  // ページロード状態の詳細追跡
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('=== Page started loading ===');
  });

  mainWindow.webContents.on('did-stop-loading', () => {
    console.log('=== Page stopped loading ===');
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('=== DOM is ready ===');
    console.log('Page title:', mainWindow.webContents.getTitle());
    console.log('Page URL:', mainWindow.webContents.getURL());
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('=== Page finished loading ===');
    console.log('Final page title:', mainWindow.webContents.getTitle());
    console.log('Final page URL:', mainWindow.webContents.getURL());
  });

  // ウィンドウの準備ができたら表示
  mainWindow.once('ready-to-show', () => {
    console.log('=== Window ready to show ===');
    mainWindow.show();
    
    // 開発環境のみDevToolsを開く
    if (isDev) {
      console.log('Opening DevTools in development mode');
      mainWindow.webContents.openDevTools();
    }
  });

  // ウィンドウが閉じられた時の処理
  mainWindow.on('closed', () => {
    console.log('=== Main window closed ===');
    mainWindow = null;
  });

  // ウィンドウが最小化/復元されたときの追跡
  mainWindow.on('minimize', () => {
    console.log('Window minimized');
  });

  mainWindow.on('restore', () => {
    console.log('Window restored');
  });

  // ウィンドウがフォーカスを失った/得たときの追跡
  mainWindow.on('blur', () => {
    console.log('Window lost focus');
  });

  mainWindow.on('focus', () => {
    console.log('Window gained focus');
  });
}

// アプリケーションの準備ができた時の処理
app.whenReady().then(() => {
  createWindow();

  // macOSでdockアイコンがクリックされた時の処理
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // メニューバーの設定
  if (process.platform === 'darwin') {
    const template = [
      {
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];
    
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
});

// すべてのウィンドウが閉じられた時の処理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// セキュリティ: 新しいウィンドウの作成を制御
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; 