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

  console.log('Loading URL:', url);
  console.log('isDev:', isDev);
  console.log('app.isPackaged:', app.isPackaged);
  console.log('__dirname:', __dirname);
  console.log('Process PATH:', process.env.PATH);
  console.log('Current working directory:', process.cwd());
  
  mainWindow.loadURL(url).catch(err => {
    console.error('Failed to load URL:', err);
  });

  // WebContentsのエラーハンドリングを追加
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load page:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('WebContents crashed');
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.error('WebContents became unresponsive');
  });

  // コンソールメッセージを取得
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Console [${level}]: ${message} (${sourceId}:${line})`);
  });

  // DOM読み込み完了後のチェック
  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready');
  });

  // ウィンドウの準備ができたら表示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 開発環境のみDevToolsを開く
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // ウィンドウが閉じられた時の処理
  mainWindow.on('closed', () => {
    mainWindow = null;
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