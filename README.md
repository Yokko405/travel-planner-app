# 旅行プラン提案アプリ

Gemini APIを使用して、あなたの希望に合わせた旅行プランを3案提案するWebアプリケーションです。

## 機能

- 入力フォーム：希望要素（温泉/秘境/歴史建造物/グルメ/自然/アート）、出発地、予算、日程、時期
- Gemini APIで旅行先を3案提案
- 提案結果をローカルストレージに保存・閲覧可能
- ワクワクする旅行っぽいデザイン（爽やか・明るい色使い）
- レスポンシブ対応

## 使い方

1. [Google AI Studio](https://makersuite.google.com/app/apikey)でGemini APIキーを取得
2. アプリを開いて、APIキーを入力
3. 希望要素、出発地、予算、日程、時期を入力
4. 「旅行プランを提案してもらう」ボタンをクリック
5. 提案された3つのプランから選ぶ

## GitHub Pagesでのデプロイ方法

### 1. GitHubリポジトリを作成

```bash
# リポジトリを初期化
git init
git add .
git commit -m "Initial commit"

# GitHubでリポジトリを作成後、以下を実行
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git branch -M main
git push -u origin main
```

### 2. GitHub Pagesを有効化

1. GitHubリポジトリのページにアクセス
2. 「Settings」タブをクリック
3. 左メニューから「Pages」を選択
4. 「Source」で「Deploy from a branch」を選択
5. 「Branch」で「main」を選択し、「/ (root)」を選択
6. 「Save」をクリック

### 3. アクセス

数分後、以下のURLでアクセスできます：
```
https://あなたのユーザー名.github.io/リポジトリ名/
```

## ローカルでの実行方法

### Pythonを使用（推奨）

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` にアクセス

### Node.jsを使用

```bash
npx serve
```

## 注意事項

- APIキーはローカルストレージに保存されます
- APIキーは他人と共有しないでください
- GitHubにプッシュする際は、APIキーがコードに含まれていないことを確認してください（現在のコードでは問題ありません）

## 技術スタック

- HTML/CSS/JavaScript（1ファイル完結）
- Gemini API
- ローカルストレージ

