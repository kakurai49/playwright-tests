# playwright-tests

Playwright を使った E2E テスト用リポジトリです。  
Web アプリケーションの自動テストを目的としています。

---

## 🔧 環境
- Node.js (LTS 推奨、v18 以上を想定)
- npm
- Playwright (@playwright/test とブラウザはローカルで準備します)

---

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
npm ci
npx playwright install --with-deps
```

### 2. テストの実行
- デフォルト（ローカル fixture + 静的サーバ）で実行  
  外部ネットワークに依存しない安定実行モードです。
```bash
npm test
```

- テスト一覧を確認
```bash
npm run test:list
```

- 外部疎通を明示的に試す（不安定な環境では実行しない）  
  BASE_URL を指定するとその URL を優先します。指定しない場合は既定の外部 URL（Stories / Yahoo）を参照します。
```bash
RUN_EXTERNAL=1 BASE_URL=https://kakurai49.github.io/stories/ npm test
```

> 💡 Codespaces / CI など外部到達が不安定な環境では、RUN_EXTERNAL を付けずに実行してください。外部疎通を確認したい場合のみ RUN_EXTERNAL=1 を明示します。

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
- `tests/stories.spec.ts`
  - デフォルト: ローカル fixture (`tests/fixtures/stories/index.html`) 上の `#storybook-root` を待機してスクリーンショットを取得
  - RUN_EXTERNAL=1 の場合のみ外部 Stories にアクセスし、疎通失敗時は診断ログを出した上で即 Fail（fallback はエラーとして扱う）
- `tests/yahoo.spec.ts`
  - デフォルト: ローカル fixture (`tests/fixtures/yahoo/index.html`) 上の `data-testid="yahoo-logo"` を待機してスクリーンショットを取得
  - RUN_EXTERNAL=1 の場合のみ Yahoo! へアクセスし、疎通失敗時は診断ログを出した上で即 Fail（fallback はエラーとして扱う）
