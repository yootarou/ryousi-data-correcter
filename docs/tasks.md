# スマート漁業PWA 開発タスク管理

## 📋 プロジェクト概要

**目的**: 漁師の操業記録を効率化し、最適な意思決定を支援するPWAを構築する  
**開始日**: 2026-03-26  
**想定期間**: フェーズ1（MVP）2-4週間

---

## 🎯 開発フェーズ

### フェーズ1: MVP（最小viable製品）- 2-4週間
- [x] 要件定義完了
- [x] UI/UX設計完了
- [x] DB設計完了
- [x] SKILL.md作成完了
- [x] プロジェクト初期化
- [x] 共通コンポーネント実装
- [x] 出航記録フォーム実装
- [x] ローカルDB実装
- [x] 基本的な記録機能完成

### フェーズ2: 完全機能 - +2週間
- [x] 縄設置記録フォーム
- [x] 縄回収記録フォーム
- [x] 帰港記録フォーム
- [x] 過去データ閲覧
- [x] 同期システム実装

### フェーズ3: 高度機能 - +4週間
- [x] ダッシュボード・分析機能
- [x] GPS航路記録
- [ ] AI予測機能
- [ ] パフォーマンス最適化

---

## 📝 タスク一覧

### ✅ 完了済みタスク

#### 要件定義・設計（2026-03-26完了）
- [x] データ項目定義（4シーン、全項目確定）
- [x] UI/UX設計（7画面、デザインシステム）
- [x] DB設計（IndexedDB + PostgreSQL）
- [x] TypeScript型定義
- [x] SKILL.md作成
- [x] Global Rule更新

---

### 🔄 進行中タスク

現在進行中のタスクはありません。

---

### 📌 次のタスク（優先度順）

#### タスク #1: プロジェクト初期化
**優先度**: 🔴 最高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 2-3時間

**チェックリスト**:
- [x] フロントエンド初期化（Vite + React + TypeScript）
- [ ] バックエンド初期化（FastAPI + Python）
- [x] 必要なパッケージインストール
- [x] ESLint/Prettier設定
- [x] フォルダ構造作成
- [ ] Git初期化・リモートリポジトリ接続
- [x] 環境変数ファイル作成（.env.example）

**ロールバックポイント**: `checkpoint-001-project-init`

**完了条件**:
- [ ] `npm run dev` でフロントエンド起動成功
- [ ] `uvicorn app.main:app --reload` でバックエンド起動成功
- [x] フォルダ構造がSKILL.mdに準拠
- [ ] Gitにコミット完了

---

#### タスク #2: デザインシステム・テーマ設定
**優先度**: 🔴 最高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 2-3時間

**チェックリスト**:
- [x] `styles/theme.ts` 作成（カラーパレット、タイポグラフィ）
- [x] `styles/globals.css` 作成（グローバルスタイル）
- [ ] Tailwind CSS設定（tailwind.config.js）
- [x] CSS変数定義
- [x] フォント読み込み設定

**ロールバックポイント**: `checkpoint-002-design-system`

**完了条件**:
- [ ] テーマ色がUI設計仕様と一致
- [ ] フォントサイズが16px（iOSズーム防止）
- [ ] レスポンシブ対応確認

---

#### タスク #3: 共通UIコンポーネント実装
**優先度**: 🔴 最高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 6-8時間

**チェックリスト**:
- [x] Button コンポーネント
- [x] TextInput コンポーネント
- [x] SelectInput コンポーネント
- [x] MultiSelect コンポーネント
- [x] CompassSelect コンポーネント（8方位）
- [x] CatchCounter コンポーネント（動的リスト）
- [x] FormSection コンポーネント（折りたたみ）
- [x] 各コンポーネントの型定義
- [x] Storybookまたはテストページで動作確認

**ロールバックポイント**: `checkpoint-003-common-components`

**完了条件**:
- [ ] 全コンポーネントがUI設計仕様に準拠
- [ ] TypeScript型エラーなし
- [ ] 各コンポーネントが独立して動作
- [ ] アクセシビリティ対応（最小タップ領域44px）

---

#### タスク #4: レイアウトコンポーネント実装
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 3-4時間

**チェックリスト**:
- [x] AppBar コンポーネント（ヘッダー）
- [x] BottomNavigation コンポーネント
- [x] AppLayout コンポーネント（全体レイアウト）
- [x] オンライン/オフライン状態表示
- [x] 同期状態表示
- [x] バッテリー表示

**ロールバックポイント**: `checkpoint-004-layout-components`

**完了条件**:
- [x] ヘッダー固定（60px）
- [x] ボトムナビ固定（64px）
- [x] メインコンテンツがスクロール可能
- [x] 4つのタブ（ホーム、記録、分析、設定）動作

---

#### タスク #5: ローカルDB（Dexie.js）実装
**優先度**: 🔴 最高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 4-5時間

**チェックリスト**:
- [x] `services/db/FishingDB.ts` 作成（Dexie設定）
- [x] テーブル定義（fishing_records, deployments, retrievals, sync_queue）
- [x] `services/db/fishingRecords.ts` リポジトリ作成
- [x] `services/db/deployments.ts` リポジトリ作成
- [x] `services/db/retrievals.ts` リポジトリ作成
- [x] `services/db/syncQueue.ts` リポジトリ作成
- [ ] CRUD操作テスト

**ロールバックポイント**: `checkpoint-005-local-db`

**完了条件**:
- [ ] IndexedDBに正常にデータ保存
- [ ] データ取得・更新・削除が動作
- [ ] ブラウザDevToolsでDBを確認可能

---

#### タスク #6: カスタムフック実装
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 3-4時間

**チェックリスト**:
- [x] `useOnlineStatus` フック（オンライン状態監視）
- [x] `useForm` フック（フォーム管理）
- [x] `useLocalDB` フック（DB操作）
- [x] `useFishingRecords` フック（記録取得）
- [ ] フックのテスト

**ロールバックポイント**: `checkpoint-006-custom-hooks`

**完了条件**:
- [ ] 各フックが独立して動作
- [ ] TypeScript型エラーなし
- [ ] 再利用可能な設計

---

#### タスク #7: 出航記録フォーム実装
**優先度**: 🔴 最高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 6-8時間

**チェックリスト**:
- [x] `pages/DeparturePage.tsx` 作成
- [x] `components/features/departure/DepartureForm.tsx` 作成
- [x] 4つのセクション実装（基本情報、漁の計画、環境・潮汐、コスト）
- [x] バリデーション実装
- [x] 月齢自動計算実装
- [x] IndexedDBへの保存
- [x] 前回データのスマート初期値

**ロールバックポイント**: `checkpoint-007-departure-form`

**完了条件**:
- [x] 全12項目が入力可能
- [x] バリデーションエラー表示
- [x] 保存ボタン押下でDBに保存
- [x] UI設計仕様と一致

---

#### タスク #8: ホーム画面・ダッシュボード実装
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 4-5時間

**チェックリスト**:
- [x] `pages/HomePage.tsx` 作成
- [x] 今日の操業カード
- [x] 今月の実績カード（2列グリッド）
- [x] 最近の記録リスト
- [x] 新しい漁を開始ボタン
- [x] データ集計ロジック

**ロールバックポイント**: `checkpoint-008-home-dashboard`

**完了条件**:
- [x] 記録データの表示
- [x] ROI計算・表示
- [x] ナビゲーション動作

---

#### タスク #9: 縄設置記録フォーム実装
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 8-10時間

**チェックリスト**:
- [x] `pages/DeploymentPage.tsx` 作成
- [x] `components/features/deployment/DeploymentForm.tsx` 作成
- [x] 位置・仕掛け情報セクション
- [x] 海洋環境セクション（折りたたみ）
- [x] 気象セクション（折りたたみ）
- [x] 潮汐・海流セクション（折りたたみ）
- [x] 魚群・生態セクション（折りたたみ）
- [ ] 前回環境データコピー機能
- [x] 月齢自動計算
- [x] IndexedDBへの保存

**ロールバックポイント**: `checkpoint-009-deployment-form`

**完了条件**:
- [ ] 全31項目が入力可能
- [ ] 折りたたみ動作
- [ ] コピー機能動作
- [x] 縄番号が自動インクリメント

---

#### タスク #10: 縄回収記録フォーム実装
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 6-8時間

**チェックリスト**:
- [x] `pages/RetrievalPage.tsx` 作成
- [x] `components/features/retrieval/RetrievalForm.tsx` 作成
- [ ] 設置情報参照カード（読み取り専用）
- [x] 回収時刻・位置入力
- [x] 針掛かり詳細入力
- [x] 魚種別カウント（動的リスト）
- [ ] サイズ分布入力
- [x] 外道入力（動的リスト）
- [x] 滞留時間自動計算
- [x] 針掛かり率自動計算
- [x] IndexedDBへの保存

**ロールバックポイント**: `checkpoint-010-retrieval-form`

**完了条件**:
- [ ] 設置情報が正しく表示
- [ ] 自動計算が動作
- [ ] 動的リストの追加・削除動作

---

#### タスク #11: 帰港記録フォーム実装
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 6-8時間

**チェックリスト**:
- [x] `pages/ReturnPage.tsx` 作成
- [x] `components/features/return/ReturnForm.tsx` 作成
- [x] 基本情報入力
- [ ] 漁獲結果表示（自動集計）
- [ ] サイズ分布グラフ
- [x] 経済データ入力・計算
- [x] ROI計算・表示
- [ ] 作業・航行データ（折りたたみ）
- [x] トラブル・メモ入力
- [x] IndexedDBへの保存

**ロールバックポイント**: `checkpoint-011-return-form`

**完了条件**:
- [ ] 全シーンのデータ集計
- [ ] ROI計算正確
- [ ] グラフ表示動作

---

#### タスク #12: 過去データ閲覧画面実装
**優先度**: 🟢 中  
**担当**: 開発者  
**期限**: -  
**所要時間**: 4-5時間

**チェックリスト**:
- [x] `pages/HistoryPage.tsx` 作成
- [x] 検索バー実装
- [x] フィルター実装（日付、魚種、漁場）
- [x] 記録カードリスト
- [x] 詳細表示モーダル
- [ ] ページネーションまたは無限スクロール

**ロールバックポイント**: `checkpoint-012-history-page`

**完了条件**:
- [x] 検索・フィルター動作
- [x] カードリスト表示
- [x] 詳細表示動作

---

#### タスク #13: 設定・同期画面実装
**優先度**: 🟢 中  
**担当**: 開発者  
**期限**: -  
**所要時間**: 3-4時間

**チェックリスト**:
- [x] `pages/SettingsPage.tsx` 作成
- [x] 同期状態カード
- [ ] ユーザー情報表示・編集
- [x] データ管理（エクスポート）
- [ ] 表示設定（ダークモード、入力確認）
- [x] アプリ情報表示

**ロールバックポイント**: `checkpoint-013-settings-page`

**完了条件**:
- [ ] 設定変更が保存される
- [x] データエクスポート動作

---

#### タスク #14: PWA対応（Service Worker）
**優先度**: 🔴 最高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 4-5時間

**チェックリスト**:
- [x] `public/service-worker.js` 作成
- [x] キャッシュ戦略実装
- [x] オフライン時のフォールバック
- [x] `public/manifest.json` 作成
- [ ] アイコン準備（192px, 512px）
- [x] インストールプロンプト実装
- [ ] PWA動作確認（Chrome DevTools）

**ロールバックポイント**: `checkpoint-014-pwa-setup`

**完了条件**:
- [ ] オフラインでアプリ起動
- [ ] ホーム画面に追加可能
- [ ] Lighthouse PWAスコア90+

---

#### タスク #15: 同期システム実装
**優先度**: 🔴 最高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 8-10時間

**チェックリスト**:
- [x] `services/sync/SyncManager.ts` 作成
- [x] 同期キュー管理
- [x] 優先度付き同期
- [x] 衝突解決ロジック
- [x] バックグラウンド同期
- [x] 同期進捗表示
- [x] エラーハンドリング・リトライ

**ロールバックポイント**: `checkpoint-015-sync-system`

**完了条件**:
- [x] Wi-Fi接続時に自動同期
- [x] 同期状態がUI反映
- [x] データ衝突が正しく解決

---

#### タスク #16: バックエンドAPI実装（基本）
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 6-8時間

**チェックリスト**:
- [x] FastAPIセットアップ
- [x] PostgreSQL接続設定
- [x] `api/v1/fishing.py` エンドポイント実装
- [x] `api/v1/sync.py` エンドポイント実装
- [x] Pydanticスキーマ定義
- [x] CORSミドルウェア設定
- [x] API仕様書（Swagger）

**ロールバックポイント**: `checkpoint-016-backend-api`

**完了条件**:
- [x] `/v1/fishing/records` GET/POST動作
- [x] `/v1/sync/upload` POST動作
- [x] Swagger UI で確認可能

---

#### タスク #17: バックエンドDB（PostgreSQL）設定
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 4-5時間

**チェックリスト**:
- [x] Supabaseプロジェクト作成
- [x] テーブル作成（fishing_records, deployments, retrievals）
- [x] インデックス設定
- [x] RLS（Row Level Security）設定
- [x] マイグレーションファイル作成
- [x] シードデータ投入

**ロールバックポイント**: `checkpoint-017-backend-db`

**完了条件**:
- [x] テーブル作成完了
- [x] APIからデータ保存・取得可能

---

#### タスク #18: フロント/バック統合
**優先度**: 🔴 最高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 4-5時間

**チェックリスト**:
- [x] `services/api/client.ts` 設定
- [x] `services/api/fishingAPI.ts` 実装
- [x] `services/api/syncAPI.ts` 実装
- [x] 環境変数設定（.env）
- [x] 認証トークン管理
- [x] エラーハンドリング
- [x] 統合テスト

**ロールバックポイント**: `checkpoint-018-frontend-backend-integration`

**完了条件**:
- [x] フロントからAPIリクエスト成功
- [x] データがSupabaseに保存
- [x] 同期が正常動作

---

#### タスク #19: テスト実装
**優先度**: 🟢 中  
**担当**: 開発者  
**期限**: -  
**所要時間**: 6-8時間

**チェックリスト**:
- [x] 共通コンポーネントのユニットテスト
- [x] カスタムフックのテスト
- [x] DB操作のテスト
- [x] API通信のモックテスト
- [x] フォーム送信のインテグレーションテスト
- [ ] E2Eテスト（Playwright/Cypress）

**ロールバックポイント**: `checkpoint-019-testing`

**完了条件**:
- [x] テストカバレッジ70%以上
- [x] 全テストが通過（フロント34件、バックエンド9件）

---

#### タスク #20: デプロイ設定
**優先度**: 🟡 高  
**担当**: 開発者  
**期限**: -  
**所要時間**: 3-4時間

**チェックリスト**:
- [x] Cloudflare Pagesアカウント設定
- [x] ビルド設定（wrangler.toml）
- [x] 環境変数設定
- [x] CI/CD パイプライン（GitHub Actions）
- [ ] ドメイン設定
- [ ] HTTPS設定

**ロールバックポイント**: `checkpoint-020-deployment`

**完了条件**:
- [x] プロダクションURL発行
- [x] 自動デプロイ動作
- [x] PWAとして動作確認

---

## 🚨 緊急ロールバック手順

### 不具合発生時の対応フロー

```
1. 症状の確認
   ↓
2. 直前のチェックポイント特定
   ↓
3. ロールバック実行
   ↓
4. 動作確認
   ↓
5. 原因調査・修正
   ↓
6. 再テスト・再デプロイ
```

---

### ロールバックコマンド

#### Gitでのロールバック

```bash
# 1. 現在の状態を確認
git status
git log --oneline -10

# 2. チェックポイントタグ一覧を確認
git tag -l "checkpoint-*"

# 3. 特定のチェックポイントに戻る（一時的）
git checkout checkpoint-005-local-db

# 4. 動作確認後、新しいブランチとして保存
git checkout -b rollback-to-005

# 5. または、強制的にmainブランチを巻き戻す（危険）
git reset --hard checkpoint-005-local-db
git push --force origin main
```

#### データベースのロールバック

```bash
# IndexedDB: ブラウザのDevToolsから手動削除
# Application > Storage > IndexedDB > FishingAppDB > Delete Database

# PostgreSQL: マイグレーションの巻き戻し
cd backend
alembic downgrade -1  # 1つ前に戻す
alembic downgrade checkpoint-017  # 特定バージョンに戻す
```

#### パッケージのロールバック

```bash
# package.jsonから特定バージョンに戻す
npm install react@18.2.0 --save-exact

# または、package-lock.jsonごと復元
git checkout checkpoint-003-common-components -- package.json package-lock.json
npm ci
```

---

### チェックポイント作成手順

各タスク完了時に必ず実行：

```bash
# 1. 全ての変更をステージング
git add .

# 2. コミット（タスク番号を含める）
git commit -m "feat: タスク#3 共通UIコンポーネント実装完了

- Button, TextInput, SelectInput実装
- TypeScript型定義完了
- UI設計仕様に準拠"

# 3. チェックポイントタグを作成
git tag -a checkpoint-003-common-components -m "タスク#3完了: 共通UIコンポーネント"

# 4. リモートにプッシュ
git push origin main
git push origin checkpoint-003-common-components
```

---

### トラブルシューティング

#### 問題1: ビルドエラー

```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュクリア
npm run clean  # package.jsonに定義が必要
rm -rf .vite

# TypeScriptエラー確認
npm run type-check
```

#### 問題2: IndexedDBエラー

```javascript
// ブラウザコンソールで実行
indexedDB.deleteDatabase('FishingAppDB');
location.reload();
```

#### 問題3: 同期エラー

```bash
# 同期キューをクリア
# ブラウザコンソールで実行:
await db.sync_queue.clear();

# または、Settings画面から「同期キューをクリア」ボタン実装
```

#### 問題4: Service Workerエラー

```bash
# Service Worker登録解除
# ブラウザコンソールで実行:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});

# その後、ページリロード
location.reload();
```

---

## 📊 進捗管理

### 進捗トラッキング

| フェーズ | 完了タスク | 全タスク | 進捗率 | 状態 |
|---------|----------|---------|-------|------|
| フェーズ1 | 8 | 8 | 100% | ✅ 完了 |
| フェーズ2 | 7 | 7 | 100% | ✅ 完了 |
| フェーズ3 | 2 | 4 | 50% | 🔄 進行中 |
| **合計** | **17** | **19** | **89%** | - |

### 週次目標

#### Week 1
- [x] タスク #1-4: プロジェクト初期化〜レイアウト完成
- 目標: 基本的な画面構成完成

#### Week 2
- [x] タスク #5-8: DB実装〜ホーム画面完成
- 目標: 出航記録とダッシュボード動作

#### Week 3
- [x] タスク #9-11: 縄設置・回収・帰港フォーム完成
- 目標: 全フォーム動作

#### Week 4
- [x] タスク #12-15: 過去データ閲覧、同期システム完成
- 目標: MVP完成

#### Week 5-6
- [x] タスク #16-20: バックエンド実装、テスト、デプロイ
- 目標: プロダクション環境稼働

---

## 🔍 品質チェックリスト

各タスク完了時に確認：

### コード品質
- [ ] TypeScriptエラーなし（`npm run type-check`）
- [ ] ESLintエラーなし（`npm run lint`）
- [ ] Prettierフォーマット済み（`npm run format`）
- [ ] console.log削除済み
- [ ] 未使用インポート削除済み

### 機能動作
- [ ] 期待通りに動作
- [ ] エラーハンドリング実装
- [ ] ローディング状態表示
- [ ] バリデーション動作

### UI/UX
- [ ] デザイン仕様に準拠
- [ ] レスポンシブ対応
- [ ] アクセシビリティ対応（最小44px）
- [ ] iOS/Androidで動作確認

### パフォーマンス
- [ ] 初回ロード3秒以内
- [ ] インタラクション100ms以内
- [ ] メモリリークなし

### セキュリティ
- [ ] XSS対策済み
- [ ] CSRF対策済み
- [ ] 認証トークン適切に管理

---

## 📝 変更履歴

### 2026-03-27
- GPS航路記録機能追加（リアルタイム追跡、Leafletによる航路マップ、トラッキングコントロール）
- ダッシュボード・分析機能追加（漁獲トレンド、魚種別内訳、収益分析、漁場マップ）
- タスク #15-#20 全完了（同期システム、バックエンドAPI、DB設定、フロント/バック統合、テスト、デプロイ設定）
- フロントエンドテスト34件、バックエンドテスト9件 全パス
- GitHub Actions CI/CD、Dockerfile、Cloudflare Pages設定完了
- [x] 航路ページの投縄/回収導線を追加（マップ下の投縄記録/帰港ボタン、投縄中一覧、投縄中カードから回収記録遷移、回収済み状態表示）
- [x] 出航完了後の再フェッチ不発を修正（`/departure?autostart=1` 到達時に当日レコードを再取得し、ページリロードなしで投縄記録ボタン表示へ切替）
- [x] 出航完了時の重複操業中レコード問題を修正（同日未帰港レコードがある場合は再利用して更新し、最近の記録表示も同日未帰港を1件に集約）
- [x] 出航フォームの乗組員選択肢を更新（`船長、悠馬、TOMO、伊藤、裕輝、陽太郎`）

### 2026-03-26
- tasks.md作成
- フェーズ1-3のタスク定義
- ロールバック手順追加
- チェックポイント管理追加

---

## 🆘 ヘルプ・サポート

### 問題発生時の連絡先
- **緊急**: （連絡先を記載）
- **技術相談**: （連絡先を記載）

### 参考ドキュメント
- [SKILL.md](./fishing-pwa-skill.md) - 開発ガイドライン
- [Global Rule](./global-rule.md) - 開発ルール
- [UI設計仕様](./ui-design.md) - UI/UX仕様

### 関連リンク
- React公式: https://react.dev/
- Dexie.js: https://dexie.org/
- FastAPI: https://fastapi.tiangolo.com/
- Supabase: https://supabase.com/docs

---

## 📌 メモ・備考

### 開発環境
- Node.js: v18以上
- Python: 3.11以上
- ブラウザ: Chrome/Safari/Firefox最新版

### 重要な注意事項
1. **必ずチェックポイント作成**: 各タスク完了時にGitタグ作成
2. **本番データに注意**: テスト時は必ず開発環境で実施
3. **バックアップ**: 重要な変更前に必ずバックアップ
4. **ドキュメント更新**: コード変更時は関連ドキュメントも更新

---

**最終更新**: 2026-03-27
**次回レビュー**: フェーズ3完了時（AI予測機能・パフォーマンス最適化）