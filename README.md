# playwright-tests

Playwright を使った E2E テスト用リポジトリです。  
Web アプリケーションの自動テストを目的としています。

---

## 🔧 環境
- Node.js (LTS 推奨)
- npm
- Playwright

---

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
npm install
npm run playwright:install
```

### 2. テストの実行
- すべてのテストを実行
```bash
npm test
```

- Yahoo! トップページのスクリーンショットテストのみ実行
```bash
npm run test:yahoo
```

テスト結果のスクリーンショットは `test-results/yahoo-home.png` に生成されます。

> 💡 プロキシ経由のネットワーク環境では、`HTTP_PROXY` または `HTTPS_PROXY` 環境変数が設定されている場合に Playwright が自動的に利用します。外部サイトへ到達できない場合はプロキシの設定を確認してください。

---

## 📂 ディレクトリ構成（暫定）
playwright-tests/
├── tests/              # テストコード
├── playwright.config.* # Playwright 設定
├── package.json
└── README.md

---

## 🧪 含まれているテスト
- `tests/yahoo.spec.ts`: Yahoo! トップページへアクセスし、タイトルを検証した上でフルページスクリーンショットを取得します。
