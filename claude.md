# 作業ログ

## 再コミット・再プッシュ対応（2026-03-27）

- 要望: `https://github.com/yootarou/ryousi-data-correcter.git` へ再度コミットしてプッシュしたい。
- 実施:
  - 変更差分を確認し、作業内容（出航/帰港/航路UI統合、重複操業中防止、乗組員候補更新、関連ドキュメント更新）を一括でステージングした。
  - コミットを作成後、`origin/main` へ push を実行する。
- 備考:
  - 本項目は今回依頼に対する実行ログとして追記。

## 乗組員選択肢の更新（2026-03-27）

- 要望: 出航フォームの乗組員候補を `船長、悠馬、TOMO、伊藤、裕輝、陽太郎` に変更したい。
- 実装:
  - `frontend/src/components/features/departure/DepartureForm.tsx` の `CREW_OPTIONS` を指定された6件へ差し替え。
  - 既存の `MultiSelect` 構造は維持し、選択肢データのみ更新。
- 検証:
  - 対象ファイルの lint エラーなし。

## 出航完了後の重複「操業中」解消と記録導線安定化（2026-03-27）

- 要望: 出航完了を複数回行うと「最近の記録」に操業中カードが重複表示され、記録ページで投縄記録導線の表示が不安定になる問題を解消したい。
- 実装:
  - `frontend/src/services/db/fishingRecords.ts` を更新し、`getByDate` を「当日レコードの最新 created_at 優先」に変更。`getActiveByDate` を新設し、当日未帰港レコードを最新1件で取得できるようにした。
  - `getToday` は `getActiveByDate(today)` を優先し、存在しない場合に `getByDate(today)` を返すよう変更。`getRecent` / `getAll` も `created_at` で安定ソートするよう調整。
  - `frontend/src/hooks/useDepartureForm.ts` の保存処理を変更し、同日未帰港レコードが存在する場合は新規作成せず既存レコードを更新する方式に変更。重複作成を防止した。
  - `frontend/src/pages/HomePage.tsx` の「最近の記録」で、同日未帰港レコードは最新1件のみ表示するようにし、重複「操業中」表示を抑止した。
- 検証:
  - 変更対象ファイルの lint エラーなし。
  - `frontend` で `npm run build` 成功（TypeScript/Vite ビルド完了）。
- ドキュメント:
  - `docs/tasks.md` の変更履歴（2026-03-27）に本対応をチェック付きで追記。

## 出航完了後の再フェッチ不発修正（2026-03-27）

- 要望: 出航完了後に同じ `/departure` へ遷移した際、`useTodayRecord` が初回マウント時のみの取得となり、投縄記録ボタンが表示されない問題を解消したい。
- 実装:
  - `frontend/src/pages/DeparturePage.tsx` で `useTodayRecord` の `refresh` を受け取り、`autostart=1` 到達時に `useEffect` から再取得を実行するよう変更。
  - 既存の表示分岐 `hasActiveVoyage && todayRecord` は維持し、通常ケース（未記録/帰港済み）のフォーム表示ロジックを崩さない構成にした。
- 検証:
  - `DeparturePage.tsx` の lint エラーなし。
  - `frontend` で `npm run build` 成功（TypeScript/Vite ビルド完了）。
- ドキュメント:
  - `docs/tasks.md` の変更履歴（2026-03-27）に本修正をチェック付きで追記。

## 記録タブ・ホーム・航路UIレイアウト統合（2026-03-27）

- 要望: 記録タブ（`/departure`）で本日航海済み・未帰港のときは航路ページと同一のUI（マップ・投縄/帰港・投縄状況・統計）を表示し、先頭に出港情報の要約を置く。ホームの「投縄記録を追加」「航路」2ボタンを削除しダッシュボード化、操業中は `/departure` への単一CTAのみに。
- 実装:
  - `VoyageRecordingPanel` を `frontend/src/components/features/route/` に新規作成し、RoutePage の状態・ロジック・UIをここに移植。`recordId` / `autostartGps` / `showRecordContextCard` / `onFinishNavigate` を props 化。
  - `RoutePage` を薄いシェルに変更し、Panel を呼び出すだけに。
  - `DeparturePage` で `useTodayRecord` を利用し、未帰港なら要約カード + `VoyageRecordingPanel`、それ以外はフォームを表示。`?autostart=1` でGPS開始。
  - `useDepartureForm` の保存後遷移を `/departure?autostart=1` に変更。
  - `HomePage` から2ボタン削除、今日の操業カードをダッシュボード化（船・港・漁場・投縄回数等）。操業中のみ「操業画面を開く」1本の導線。
- 確認: `npm run build` 成功。

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
