# My Admin (TypeScript版)

工数管理、ToDo管理、サブスクリプション管理を一元化するデスクトップアプリケーション

## 技術スタック

- **フレームワーク**: Next.js 14 (React 18)
- **言語**: TypeScript
- **デスクトップ**: Electron
- **スタイリング**: Tailwind CSS + Lucide React Icons
- **データベース**: SQLite (better-sqlite3)
- **ORM**: Drizzle ORM

## 機能

- **工数管理**: 作業時間の記録と集計
- **ToDo管理**: タスク管理と進捗状況の追跡
- **サブスク管理**: 契約サービスの費用管理と更新日の追跡
- **ダッシュボード**: 各機能の概要を表示

## 必要条件

- Node.js 18以上
- npm または yarn
- Windows 10+、macOS 10.15+、または Linux

## インストール方法

1. リポジトリをクローン
   ```bash
   git clone <リポジトリURL>
   cd My-Admin
   ```

2. 依存パッケージをインストール
   ```bash
   npm install
   # または
   yarn install
   ```

## 使用方法

### 開発モード（Webブラウザ）

```bash
npm run dev
# または
yarn dev
```

ブラウザで `http://localhost:3000` にアクセス

### 開発モード（Electronデスクトップアプリ）

```bash
npm run electron-dev
# または
yarn electron-dev
```

### 本番ビルド

```bash
# Webアプリケーションとしてビルド
npm run build
npm run start

# デスクトップアプリとしてビルド
npm run electron-pack
# または
yarn electron-pack
```

## プロジェクト構成

```
My-Admin/
├── src/                    # ソースコード
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   │   ├── timesheet/ # 工数管理API
│   │   │   ├── todo/      # ToDo管理API
│   │   │   └── subscription/ # サブスク管理API
│   │   ├── layout.tsx     # ルートレイアウト
│   │   ├── page.tsx       # メインページ
│   │   └── globals.css    # グローバルスタイル
│   ├── components/        # Reactコンポーネント
│   │   ├── Dashboard.tsx  # ダッシュボード
│   │   ├── Timesheet.tsx  # 工数管理
│   │   ├── Todo.tsx       # ToDo管理
│   │   └── Subscription.tsx # サブスク管理
│   ├── lib/              # ユーティリティ
│   │   └── database.ts   # データベース設定
│   └── types/            # TypeScript型定義
│       └── index.ts      # 型定義
├── assets/               # アイコンなどのアセット
├── main.js              # Electronメインプロセス
├── preload.js           # Electronプリロード
├── package.json         # パッケージ設定
├── tsconfig.json        # TypeScript設定
├── tailwind.config.js   # Tailwind設定
└── next.config.js       # Next.js設定
```

## API仕様

### 工数管理 (`/api/timesheet`)
- `GET`: 全ての工数データを取得
- `POST`: 新しい工数データを作成
- `PUT`: 工数データを更新
- `DELETE`: 工数データを削除

### ToDo管理 (`/api/todo`)
- `GET`: 全てのToDoデータを取得
- `POST`: 新しいToDoデータを作成
- `PUT`: ToDoデータを更新
- `DELETE`: ToDoデータを削除

### サブスクリプション管理 (`/api/subscription`)
- `GET`: 全てのサブスクリプションデータを取得
- `POST`: 新しいサブスクリプションデータを作成
- `PUT`: サブスクリプションデータを更新
- `DELETE`: サブスクリプションデータを削除

## カスタマイズ方法

- **テーマカラーの変更**: `tailwind.config.js` のcolors設定を修正
- **アプリアイコンの変更**: `assets/myadmin_icon.png` を置き換え
- **データベーススキーマの変更**: `src/lib/database.ts` を修正

## 開発用スクリプト

```bash
# 型チェック
npm run type-check

# リンター実行
npm run lint

# Electronアプリをパッケージ化
npm run electron-pack
```

## トラブルシューティング

### データベースエラー
- データベースファイルは以下の場所に作成されます：
  - Windows: `%APPDATA%/myadmin/app.db`
  - macOS: `~/Library/Application Support/myadmin/app.db`
  - Linux: `~/.local/share/myadmin/app.db`

### ビルドエラー
- Node.jsのバージョンが18以上であることを確認
- 依存パッケージを再インストール: `rm -rf node_modules package-lock.json && npm install`

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 開発者

Ryosuke Arima

## 変更履歴

### v2.0.0 (TypeScript版)
- PythonからTypeScriptに移行
- ElectronとNext.jsによるデスクトップアプリ
- TailwindCSSによるモダンなUI
- SQLiteとDrizzle ORMによるデータ管理 