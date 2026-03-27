# Error Fix 手順

1. エラーメッセージと再現手順を整理する。
2. 最小再現ケースを作り、原因を切り分ける。
3. ログ・スタックトレース・依存関係を確認する。
4. 修正後に再現手順で再検証する。
5. 再発防止策を `docs/tasks.md` に記録する。


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
