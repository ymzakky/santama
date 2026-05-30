#!/usr/bin/env python3
"""
microCMS マネジメントAPI（POST /api/v1/media）で画像をアップロードし、
返却された images.microcms-assets.io のURLで CSV の画像参照を全置換するスクリプト。

対象列: eyecatch / thumbnail / body 内の <img src="...">

依存: Python 3.8+ 標準ライブラリのみ（外部パッケージ不要）

== 使い方 ==
  export MICROCMS_SERVICE_ID="your-service-id"          # {SERVICE_ID}.microcms-management.io の部分
  export MICROCMS_MANAGEMENT_API_KEY="xxxxxxxx"         # 「メディアのアップロード」権限を有効化したキー

  # まずドライラン（アップロードせず、対象と置換結果のみ確認）
  python3 upload_images_and_rewrite_csv.py \
      --build-dir ./build \
      --in-csv ./活動状況報告_microcms_import.csv \
      --out-csv ./活動状況報告_microcms_import.uploaded.csv \
      --map-file ./upload_map.json \
      --dry-run

  # 本番実行（実際にアップロード）
  python3 upload_images_and_rewrite_csv.py \
      --build-dir ./build \
      --in-csv ./活動状況報告_microcms_import.csv \
      --out-csv ./活動状況報告_microcms_import.uploaded.csv \
      --map-file ./upload_map.json

== 冪等性・再開 ==
  アップロード結果は --map-file (JSON, {ローカルファイル名: URL}) に逐次保存されます。
  途中で失敗しても、再実行すると map-file に記録済みの画像はスキップされます。
  ※ map-file を消すと再アップロードになり、microCMS上に重複アセットが作られます。必ず保持してください。
"""
import argparse
import csv
import io
import json
import mimetypes
import os
import re
import sys
import time
import urllib.error
import urllib.request

CSV_COLS = [
    'コンテンツID', 'title', 'subtitle', 'eventDate', 'reporter', 'reporterCompany',
    'reporterBusiness', 'excerpt', 'body', 'eyecatch', 'category', 'slug', 'thumbnail',
]
# 入力CSVの1列目ヘッダー（改行を含む）を完全一致で再現する
HEADER_ID = "コンテンツID\n※空欄で構いません。特定の値を設定したい場合に入力してください。"


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def build_path_index(build_dir):
    """build配下の画像を basename -> フルパス で索引する（basenameは日付接頭辞付きで一意）。"""
    idx = {}
    for root, _dirs, files in os.walk(build_dir):
        for fn in files:
            if fn.lower().endswith(('.jpg', '.jpeg', '.png')):
                if fn in idx:
                    log(f"[警告] basename重複: {fn}\n  既存: {idx[fn]}\n  新規: {os.path.join(root, fn)}")
                idx[fn] = os.path.join(root, fn)
    return idx


def collect_referenced(rows):
    """CSV各行の eyecatch / thumbnail / body から参照画像ファイル名を集める（出現順を保持）。"""
    col = {name: i for i, name in enumerate(CSV_COLS)}
    refs = []
    seen = set()

    def add(name):
        name = name.strip()
        if name and name not in seen:
            seen.add(name)
            refs.append(name)

    for r in rows:
        add(r[col['eyecatch']])
        for t in r[col['thumbnail']].split(','):
            add(t)
        for m in re.findall(r'src="([^"]+)"', r[col['body']]):
            add(m)
    return refs


def post_media(service_id, api_key, filepath, retries=4):
    """POST /api/v1/media に1ファイルアップロードし、返却URLを返す。"""
    url = f"https://{service_id}.microcms-management.io/api/v1/media"
    fname = os.path.basename(filepath)
    mime = mimetypes.guess_type(fname)[0] or 'application/octet-stream'
    with open(filepath, 'rb') as fh:
        filedata = fh.read()

    boundary = '----microcmsformboundary7MA4YWxkTrZu0gW'
    buf = io.BytesIO()
    buf.write(f'--{boundary}\r\n'.encode())
    buf.write(
        f'Content-Disposition: form-data; name="file"; filename="{fname}"\r\n'.encode('utf-8')
    )
    buf.write(f'Content-Type: {mime}\r\n\r\n'.encode())
    buf.write(filedata)
    buf.write(f'\r\n--{boundary}--\r\n'.encode())
    body = buf.getvalue()

    headers = {
        'X-MICROCMS-API-KEY': api_key,
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Content-Length': str(len(body)),
    }

    last_err = None
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, data=body, headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                payload = json.loads(resp.read().decode('utf-8'))
                if 'url' not in payload:
                    raise RuntimeError(f"レスポンスにurlがありません: {payload}")
                return payload['url']
        except urllib.error.HTTPError as e:
            detail = e.read().decode('utf-8', 'replace')
            last_err = f"HTTP {e.code}: {detail}"
            # 429(レート制限) / 5xx はリトライ、それ以外は即中断
            if e.code == 429 or 500 <= e.code < 600:
                wait = 2 ** attempt
                log(f"  [{fname}] {last_err} -> {wait}s後リトライ ({attempt + 1}/{retries})")
                time.sleep(wait)
                continue
            raise RuntimeError(last_err)
        except (urllib.error.URLError, TimeoutError) as e:
            last_err = f"接続エラー: {e}"
            wait = 2 ** attempt
            log(f"  [{fname}] {last_err} -> {wait}s後リトライ ({attempt + 1}/{retries})")
            time.sleep(wait)
    raise RuntimeError(f"アップロード失敗（リトライ上限）: {fname} / {last_err}")


def rewrite_rows(rows, mapping):
    """mapping(ローカル名->URL)を使って eyecatch / thumbnail / body を置換した新行を返す。"""
    col = {name: i for i, name in enumerate(CSV_COLS)}
    out = []
    for r in rows:
        r = list(r)
        # eyecatch
        ey = r[col['eyecatch']].strip()
        if ey:
            r[col['eyecatch']] = mapping.get(ey, ey)
        # thumbnail（カンマ区切り）
        thumbs = [t.strip() for t in r[col['thumbnail']].split(',') if t.strip()]
        r[col['thumbnail']] = ','.join(mapping.get(t, t) for t in thumbs)
        # body 内の src="ローカル名"

        def _sub(m):
            name = m.group(1)
            return f'src="{mapping.get(name, name)}"'

        r[col['body']] = re.sub(r'src="([^"]+)"', _sub, r[col['body']])
        out.append(r)
    return out


def write_csv(path, rows):
    out_header = [HEADER_ID] + CSV_COLS[1:]
    with open(path, 'w', newline='', encoding='utf-8-sig') as fp:
        w = csv.writer(fp, quoting=csv.QUOTE_MINIMAL)
        w.writerow(out_header)
        for r in rows:
            w.writerow(r)


def main():
    ap = argparse.ArgumentParser(description="microCMSへ画像アップロードしCSVのURLを差し替える")
    ap.add_argument('--build-dir', required=True, help='zip展開後の build ディレクトリ')
    ap.add_argument('--in-csv', required=True, help='入力CSV（ローカルファイル名版）')
    ap.add_argument('--out-csv', required=True, help='出力CSV（URL差し替え版）')
    ap.add_argument('--map-file', default='upload_map.json', help='アップロード結果キャッシュ(JSON)')
    ap.add_argument('--sleep', type=float, default=0.3, help='アップロード間の待機秒(レート制限対策)')
    ap.add_argument('--limit', type=int, default=0, help='アップロード上限枚数(0=無制限,動作確認用)')
    ap.add_argument('--dry-run', action='store_true', help='アップロードせず対象確認のみ')
    args = ap.parse_args()

    service_id = os.environ.get('MICROCMS_SERVICE_ID', '')
    api_key = os.environ.get('MICROCMS_MANAGEMENT_API_KEY', '')

    # 入力CSV読み込み
    with open(args.in_csv, encoding='utf-8-sig') as fp:
        all_rows = list(csv.reader(fp))
    if not all_rows:
        log("入力CSVが空です"); sys.exit(1)
    header, data_rows = all_rows[0], all_rows[1:]
    if len(header) != len(CSV_COLS):
        log(f"[警告] 列数が想定({len(CSV_COLS)})と異なります: {len(header)}")

    path_idx = build_path_index(args.build_dir)
    refs = collect_referenced(data_rows)
    log(f"記事数: {len(data_rows)} / 参照画像(一意): {len(refs)} / build内画像: {len(path_idx)}")

    missing = [f for f in refs if f not in path_idx]
    if missing:
        log(f"[エラー] buildに存在しない参照画像があります: {missing}")
        sys.exit(1)

    # キャッシュ読み込み
    mapping = {}
    if os.path.exists(args.map_file):
        with open(args.map_file, encoding='utf-8') as fp:
            mapping = json.load(fp)
        log(f"キャッシュ読込: {len(mapping)}件アップロード済み")

    todo = [f for f in refs if f not in mapping]
    log(f"アップロード対象: {len(todo)}件（スキップ: {len(refs) - len(todo)}件）")

    if args.dry_run:
        log("[DRY-RUN] アップロードは行いません。出力CSVはキャッシュ済みURLのみ反映します。")
    else:
        if not service_id or not api_key:
            log("[エラー] 環境変数 MICROCMS_SERVICE_ID / MICROCMS_MANAGEMENT_API_KEY を設定してください")
            sys.exit(1)
        done = 0
        for fn in todo:
            if args.limit and done >= args.limit:
                log(f"[limit] {args.limit}件に達したため停止"); break
            url = post_media(service_id, api_key, path_idx[fn])
            mapping[fn] = url
            done += 1
            log(f"  [{done}/{len(todo)}] {fn} -> {url}")
            # 逐次保存（再開可能にする）
            with open(args.map_file, 'w', encoding='utf-8') as fp:
                json.dump(mapping, fp, ensure_ascii=False, indent=1)
            time.sleep(args.sleep)
        log(f"アップロード完了: {done}件")

    # CSV書き出し（キャッシュにあるものだけURL化。未アップロードはローカル名のまま残る）
    new_rows = rewrite_rows(data_rows, mapping)
    write_csv(args.out_csv, new_rows)
    remaining = [f for f in refs if f not in mapping]
    log(f"出力: {args.out_csv}")
    if remaining:
        log(f"[注意] 未アップロードのためローカル名のまま残った参照: {len(remaining)}件")
    else:
        log("全画像参照をURLへ差し替え済み。")


if __name__ == '__main__':
    main()
