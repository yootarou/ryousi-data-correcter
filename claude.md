# 作業ログ

## 航路ページの投縄/回収導線追加（2026-03-27）

- 要望: 航路記録ページのマップ下に「投縄記録」「帰港」ボタンを表示し、投縄登録後に「投縄中」表示付きの一覧から回収記録へ進める導線を追加したい。
- 実装: `frontend/src/services/db/retrievals.ts` に `getByRecordId(recordId)` を追加し、投縄記録群に対応する回収記録を一括取得できるようにした。
- 実装: `frontend/src/hooks/useRouteData.ts` を拡張し、航路点・投縄・回収を並行取得して `retrievals` を返却するように変更した。
- 実装: `frontend/src/pages/RoutePage.tsx` のマップ下に「投縄記録」「帰港」ボタンを追加し、投縄一覧カードを表示するUIを追加した。
- 状態表示: 各投縄カードで回収の有無を判定し、未回収は「投縄中」、回収済みは「回収済み」バッジを表示。未回収カード押下で回収記録ページへ遷移、回収済みカードは誤操作防止のため押下不可にした。
- ドキュメント: `docs/tasks.md` の変更履歴に、本導線追加をチェック付きで追記した。
- 確認: 変更対象3ファイルのLintエラーなし。`frontend` で `npm run build` 成功（TypeScript/Viteビルド完了）。
- 漁場マップ: `FishingSpotMap` を OpenStreetMap ベース + GEBCO WMS オーバーレイに変更。`VoyageSummary` の Leaflet に `maxZoom: 13` を設定。
- 作業ログの重複見出しを整理した。
- コミット `9201138` を `origin/main`（HTTPS）へ push した。

## GitHub リモートへのコミット（2025-03-27）

- 当初リモート `origin` を SSH で設定したのち、利用者要望で **HTTPS** `https://github.com/yootarou/ryousi-data-correcter.git` に変更した。
- 未コミットの変更一式をステージし、コミット `82760b7` を作成した（メッセージ: 漁場マップ・航海サマリー、記録スキーマとローカルDB層の拡張）。
- SSH 経由の `git push` は `Permission denied (publickey)` で未実施だった。HTTPS に切り替えたうえで `git push -u origin main` を実行し、`main` をリモートに反映した（リポジトリは空の状態からの初回 push）。

## SSH `Permission denied (publickey)` の切り分け（2025-03-27）

- ローカルでは `~/.ssh/id_ed25519` が GitHub 向けにオファーされている（フィンガープリント `SHA256:TdkfsSdA76mF0exW5jDe1i+cuzw7iS6RsFsq2BkbCzI`）。それでも拒否される場合、**その公開鍵が GitHub アカウント（push 先の yootarou 等）に未登録**である可能性が高い。
- 対処: GitHub の Settings → SSH and GPG keys で `id_ed25519.pub` を追加する。または、GitHub 用に別鍵を使うなら `~/.ssh/config` に `Host github.com` と `IdentityFile` を明示する。
- `ssh-add -l` でエージェントに鍵が無い表示でも、今回のログではディスク上のデフォルト鍵は試行されているため、主因は登録漏れ側と判断した。
