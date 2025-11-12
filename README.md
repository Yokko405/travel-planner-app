# AI旅行プランナー

OpenAI（ChatGPT）を使用した旅行プラン提案アプリです。バックエンドはCloudflare Workersで動作します。

## 機能

- 行き先、日数、テーマを入力
- 「提案して！」ボタンでChatGPTが旅プランを生成
- 結果は「1日目」「2日目」…の構成で表示
- エラー時は日本語メッセージ
- APIキーはサーバー側で管理（セキュア）

## アーキテクチャ

- **フロントエンド**: HTML + JavaScript（静的ファイル）
- **バックエンド**: Cloudflare Workers（サーバーレス）
- **AI**: OpenAI GPT-4o-mini

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Cloudflare Workersの設定

#### 2.1. Cloudflareアカウントの準備

1. [Cloudflare](https://dash.cloudflare.com/)にアカウントを作成
2. Workers & Pages にアクセス

#### 2.2. Wrangler CLIのインストール（グローバル）

```bash
npm install -g wrangler
```

#### 2.3. Cloudflareにログイン

```bash
wrangler login
```

#### 2.4. OpenAI APIキーの設定

```bash
wrangler secret put OPENAI_API_KEY
```

プロンプトが表示されたら、OpenAI APIキーを入力してください。
（取得方法: https://platform.openai.com/api-keys）

#### 2.5. Basic認証の設定（オプション）

アプリへのアクセスを制限するために、Basic認証を設定できます。

```bash
# ユーザー名を設定
wrangler secret put BASIC_AUTH_USER

# パスワードを設定
wrangler secret put BASIC_AUTH_PASS
```

**注意**: 
- Basic認証を設定しない場合、誰でもアプリにアクセスできます
- 認証情報を設定すると、フロントエンドでユーザー名とパスワードの入力が必要になります
- 認証情報はブラウザのlocalStorageに保存されます（初回のみ入力）

**認証を無効にする場合**:
- 設定したシークレットを削除するか、設定しないでください
- シークレットの削除: CloudflareダッシュボードのWorkers > Settings > Variablesから削除

### 3. ローカル開発

```bash
npm run dev
```

または

```bash
wrangler dev
```

ローカルサーバーが起動します（通常は `http://localhost:8787`）。

### 4. デプロイ

```bash
npm run deploy
```

または

```bash
wrangler deploy
```

デプロイ後、表示されるURL（例: `https://ai-travel-planner.your-subdomain.workers.dev`）をコピーします。

### 5. フロントエンドの設定

#### 5.1. API URLの設定

`script.js` の `API_URL` を実際のCloudflare Workers URLに変更してください：

```javascript
const API_URL = "https://ai-travel-planner.your-subdomain.workers.dev";
```

#### 5.2. 認証情報の設定（重要）

**認証情報（ID/PW）はCloudflare Workers側で管理されます。**

Cloudflare Workers側で設定した認証情報を、フロントエンドで入力する必要があります：

1. Cloudflare Workers側で認証情報を設定（上記の「2.5. Basic認証の設定」を参照）
2. フロントエンドにアクセスした際、初回のみ認証情報を入力
3. 認証情報はブラウザのlocalStorageに保存され、次回から自動的に使用されます

**セキュリティ上の利点**:
- 認証情報はCloudflare Workers側の環境変数で管理されるため、コードに含まれません
- GitHub Pagesで公開しても、認証情報は見えません
- 認証情報を変更する場合は、Cloudflare Workers側の環境変数を変更するだけです

### 6. GitHub Pagesで公開（推奨）

GitHub Pagesは無料でpublicリポジトリに対応しています。

#### 6.1. GitHubにプッシュ

```bash
# リポジトリの初期化（まだの場合）
git init

# ファイルを追加
git add .

# コミット
git commit -m "Initial commit: AI Travel Planner"

# リモートリポジトリを追加（GitHubで作成後）
git remote add origin https://github.com/your-username/travel-planner-app.git

# プッシュ
git branch -M main
git push -u origin main
```

#### 6.2. GitHub Pagesを有効化

1. GitHubリポジトリのページにアクセス
2. **Settings** > **Pages** を開く
3. **Source** で **Deploy from a branch** を選択
4. **Branch** で **main** を選択し、**/ (root)** を選択
5. **Save** をクリック

数分後、`https://your-username.github.io/travel-planner-app/` でアプリにアクセスできます。

### 7. その他のホスティングオプション

フロントエンドは静的ファイルなので、以下の方法でもデプロイできます：

- **Cloudflare Pages**: Cloudflareダッシュボードから設定
- **Netlify**: `netlify deploy` でデプロイ
- **Vercel**: `vercel deploy` でデプロイ

または、ローカルサーバーで実行：

```bash
# Python 3の場合
python3 -m http.server 8000

# Node.jsの場合
npx serve
```

その後、ブラウザで `http://localhost:8000` にアクセスしてください。

## ファイル構成

```
/travel-planner-app
├── index.html          # フロントエンド（HTML）
├── script.js           # フロントエンド（JavaScript）
├── worker.js           # Cloudflare Workers（バックエンド）
├── wrangler.toml       # Cloudflare Workers設定
├── package.json        # Node.js依存関係
├── .gitignore          # Git除外ファイル
├── .nojekyll           # GitHub Pages用（Jekyllを無効化）
└── README.md           # このファイル
```

## 環境変数

### Cloudflare Workers（本番環境）

- `OPENAI_API_KEY`: OpenAI APIキー（`wrangler secret put` で設定）
- `BASIC_AUTH_USER`: Basic認証のユーザー名（オプション、`wrangler secret put` で設定）
- `BASIC_AUTH_PASS`: Basic認証のパスワード（オプション、`wrangler secret put` で設定）

### ローカル開発

`.dev.vars` ファイルを作成（`.gitignore`に含まれています）：

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
BASIC_AUTH_USER=your-username
BASIC_AUTH_PASS=your-password
```

**注意**: Basic認証を設定しない場合は、`BASIC_AUTH_USER` と `BASIC_AUTH_PASS` を削除するか、設定しないでください。

## GitHubリポジトリの公開設定について

### Publicリポジトリ（推奨）

- **GitHub Pages**: 無料で利用可能
- コードが公開されるため、他の人が参考にできます
- オープンソースとして公開する場合に適しています

### Privateリポジトリ

- **GitHub Pages**: 有料プランが必要
- コードを非公開にしたい場合に適しています
- その場合は、**Cloudflare Pages**、**Netlify**、または**Vercel**を使用してください（無料でprivateリポジトリに対応）

**推奨**: 無料で公開する場合は、**Publicリポジトリ + GitHub Pages** を使用してください。

## 注意事項

- OpenAI APIキーはCloudflare Workersのシークレットとして管理されます（ブラウザには送信されません）
- OpenAI APIの利用には料金がかかります（gpt-4o-miniは低価格）
- Cloudflare Workersの無料プランでも十分に動作します
- APIキーは他人と共有しないでください
- GitHubリポジトリをprivateにしても、アプリは正常に動作します
- Basic認証を設定すると、知っている人だけがアプリを使用できます
- Basic認証の認証情報はブラウザのlocalStorageに保存されます（初回のみ入力）

## トラブルシューティング

### CORSエラーが発生する場合

フロントエンドをローカルサーバーで実行してください（上記参照）。

### APIキーエラーが発生する場合

1. `wrangler secret put OPENAI_API_KEY` で正しく設定されているか確認
2. OpenAI APIキーが有効か確認（https://platform.openai.com/api-keys）

### デプロイエラーが発生する場合

1. `wrangler login` でログインしているか確認
2. `wrangler.toml` の設定を確認

## ライセンス

MIT
