// 一時的にコメントアウト - better-sqlite3のコンパイルエラーのため
// import Database from 'better-sqlite3';
// import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync } from 'fs';

// データディレクトリのパスを取得
function getDataDir(): string {
  const home = homedir();
  let dataDir: string;
  
  switch (process.platform) {
    case 'win32':
      dataDir = join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'myadmin');
      break;
    case 'darwin':
      dataDir = join(home, 'Library', 'Application Support', 'myadmin');
      break;
    default:
      dataDir = join(home, '.local', 'share', 'myadmin');
  }
  
  // ディレクトリが存在しない場合は作成
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  
  return dataDir;
}

// データベースのパス
const dbPath = join(getDataDir(), 'app.db');

// 一時的にモックオブジェクト
export const db = null;
export const rawDb = null;

// データベースの初期化とマイグレーション
export function initializeDatabase() {
  console.log('データベースは一時的に無効化されています:', dbPath);
}

// アプリケーション開始時にデータベースを初期化
initializeDatabase(); 