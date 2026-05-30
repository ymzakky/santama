# 活動状況報告 画像アップロード & CSV修正 手順書（ランブック）

`活動状況報告_microcms_import.csv` の画像参照（ローカルファイル名）を、microCMS マネジメントAPIで
アップロードした実URL（`https://images.microcms-assets.io/...`）へ差し替えるための手順です。

別環境（認証情報・ネットワークが利用できる環境）での実行を想定しています。

---

## 全体像

```
[zip展開: build/ 配下に111枚の画像]
            │
            ▼
  upload_images_and_rewrite_csv.py
   1. CSVから参照画像名(111枚)を収集
   2. POST /api/v1/media で1枚ずつアップロード
   3. 返却URLを upload_map.json に逐次保存（再開可能）
   4. eyecatch / thumbnail / body内<img> のローカル名をURLへ全置換
            │
            ▼
[活動状況報告_microcms_import.uploaded.csv]  ← microCMSへインポート
```

- 対象記事: **30件**
- アップロード画像: **111枚**（全て5MB以内＝API上限内）
- 依存: **Python 3.8+ 標準ライブラリのみ**（追加インストール不要）

---

## 事前準備

### 1. 入力ファイルを揃える

実行ディレクトリに以下を配置します。

| ファイル/ディレクトリ | 入手元 |
|---|---|
| `build/` | `doyu_santama_pages_local.zip` を展開すると現れる `build/` ディレクトリ（各記事フォルダ＋画像） |
| `活動状況報告_microcms_import.csv` | 本リポジトリのルートに格納済み |
| `upload_images_and_rewrite_csv.py` | このディレクトリ（`tools/microcms-import/`） |

```bash
unzip doyu_santama_pages_local.zip   # → build/ が展開される
```

### 2. microCMS マネジメントAPIキーを準備

1. microCMS 管理画面 → 「APIキー」→ マネジメントAPIの権限で
   **「メディアのアップロード」を有効化** したキーを発行（または既存キーに権限付与）。
2. サービスID（`https://{SERVICE_ID}.microcms-management.io` の `{SERVICE_ID}`）を確認。

### 3. 環境変数を設定

```bash
export MICROCMS_SERVICE_ID="your-service-id"
export MICROCMS_MANAGEMENT_API_KEY="xxxxxxxxxxxxxxxx"
```

> APIキーは秘匿情報です。シェル履歴やログに残さないようご注意ください。

---

## 実行手順

### STEP 1: ドライラン（アップロードせず対象確認）

```bash
python3 upload_images_and_rewrite_csv.py \
  --build-dir ./build \
  --in-csv "./活動状況報告_microcms_import.csv" \
  --out-csv "./活動状況報告_microcms_import.uploaded.csv" \
  --map-file ./upload_map.json \
  --dry-run
```

期待される出力（標準エラー）:
```
記事数: 30 / 参照画像(一意): 111 / build内画像: 111
アップロード対象: 111件（スキップ: 0件）
[DRY-RUN] ...
```
`buildに存在しない参照画像` のエラーが出ないことを確認します。

### STEP 2: 少数だけ本番テスト（任意・推奨）

`--limit` で数枚だけアップロードして、URLが正しく返るか・microCMS側に登録されるか確認します。

```bash
python3 upload_images_and_rewrite_csv.py \
  --build-dir ./build \
  --in-csv "./活動状況報告_microcms_import.csv" \
  --out-csv "./活動状況報告_microcms_import.uploaded.csv" \
  --map-file ./upload_map.json \
  --limit 3
```

### STEP 3: 本番実行（全111枚）

```bash
python3 upload_images_and_rewrite_csv.py \
  --build-dir ./build \
  --in-csv "./活動状況報告_microcms_import.csv" \
  --out-csv "./活動状況報告_microcms_import.uploaded.csv" \
  --map-file ./upload_map.json
```

完了時に `全画像参照をURLへ差し替え済み。` と表示されれば成功です。
生成された `活動状況報告_microcms_import.uploaded.csv` を microCMS にインポートしてください。

---

## 冪等性・再開・トラブル対応

- **再開可能**: アップロード結果は `upload_map.json`（`{ローカル名: URL}`）に1枚ごと保存されます。
  途中で失敗・中断しても、再実行すれば登録済みの画像は自動スキップされます。
- **重複アップロード防止**: `upload_map.json` を**消さないでください**。消すと再アップロードになり、
  microCMS メディアライブラリに重複アセットが生成されます。
- **レート制限(429)/サーバエラー(5xx)**: 自動で指数バックオフ（2,4,8,16秒）リトライします。
  混雑時は `--sleep 0.5` 等で間隔を広げてください。
- **やり直したい場合**: microCMS側のアセット削除は `DELETE /api/v2/media`、または管理画面から手動で行います。

---

## 補足: 確認・調整が必要な既知の項目

このCSVは元HTMLからの自動変換物です。インポート前に以下をご確認ください。

1. **報告者情報（reporter / reporterCompany / reporterBusiness）**
   本文に明記された18件のみ自動抽出。残12件（イベント系・複数報告者）は空欄。
   抽出値（姓のみ記載の `蓑 氏`/`栗原 氏`/`山本 氏`/`牧野 氏` 等）は要確認。
2. **category**: canonical URL基準（`newsYYYY`）。開催年と年度がずれる記事あり。
3. **slug**: 日付8桁（`YYYYMMDD`）を採用。
4. **eyecatch**: 各記事の先頭画像を採用。別画像にしたい場合は手動調整。
