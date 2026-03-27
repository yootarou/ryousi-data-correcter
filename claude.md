# 作業ログ

## GitHub リモートへのコミット（2025-03-27）

- 当初リモート `origin` を SSH で設定したのち、利用者要望で **HTTPS** `https://github.com/yootarou/ryousi-data-correcter.git` に変更した。
- 未コミットの変更一式をステージし、コミット `82760b7` を作成した（メッセージ: 漁場マップ・航海サマリー、記録スキーマとローカルDB層の拡張）。
- SSH 経由の `git push` は `Permission denied (publickey)` で未実施だった。HTTPS に切り替えたうえで `git push -u origin main` を実行し、`main` をリモートに反映した（リポジトリは空の状態からの初回 push）。

## SSH `Permission denied (publickey)` の切り分け（2025-03-27）

- ローカルでは `~/.ssh/id_ed25519` が GitHub 向けにオファーされている（フィンガープリント `SHA256:TdkfsSdA76mF0exW5jDe1i+cuzw7iS6RsFsq2BkbCzI`）。それでも拒否される場合、**その公開鍵が GitHub アカウント（push 先の yootarou 等）に未登録**である可能性が高い。
- 対処: GitHub の Settings → SSH and GPG keys で `id_ed25519.pub` を追加する。または、GitHub 用に別鍵を使うなら `~/.ssh/config` に `Host github.com` と `IdentityFile` を明示する。
- `ssh-add -l` でエージェントに鍵が無い表示でも、今回のログではディスク上のデフォルト鍵は試行されているため、主因は登録漏れ側と判断した。
