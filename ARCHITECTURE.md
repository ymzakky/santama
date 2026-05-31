# プロジェクト構成ガイド（三多摩支部ホームページ）

> 新しく参加する開発者向けに、このリポジトリの全体像を素早く掴むためのドキュメントです。
> まずこのファイルを読めば「何が・どこに・どう繋がっているか」が分かるように書いています。

---

## 1. これは何か

**東京中小企業家同友会 三多摩支部** の公式サイトです。
[Astro](https://astro.build/) による**静的サイト（SSG）**で、ビルド時に全ページを HTML として生成します。

| 項目 | 内容 |
| --- | --- |
| フレームワーク | Astro v6 |
| スタイリング | Tailwind CSS v4（`@tailwindcss/vite` 経由。設定は `src/styles/global.css` の `@theme`） |
| **コンテンツ管理（CMS）** | **microCMS**（`microcms-js-sdk` v3） |
| 言語 | TypeScript |
| リポジトリ | `https://github.com/ymzakky.github.io` 配下（`origin: https://github.com/ymzakky/santama.git`） |
| 公開URL | `https://ymzakky.github.io/santama/`（`base: /santama/`） |

> ⚠️ 現在は**テスト公開中**のため、全ページに `noindex, nofollow` メタタグが入っており検索エンジンには載りません（`src/layouts/BaseLayout.astro`）。本番公開時に外します。

---

## 2. ⭐ コンテンツ管理は microCMS で行う（最重要）

**記事・会員情報などの「中身」はコード内には無く、すべて [microCMS](https://microcms.io/) 側で管理しています。**
コードは microCMS の API からデータを取得して HTML を組み立てているだけです。記事を増やしたい・直したいときは**コードではなく microCMS の管理画面を触ります**。

### 📚 microCMS のドキュメント

困ったら公式ドキュメントを参照してください。**`https://document.microcms.io/` 配下**にAPIリファレンス・各フィールドの仕様・SDKの使い方などがすべて揃っています。

- API スキーマ / フィールドの種類: `https://document.microcms.io/manual/` 配下
- JS SDK（このプロジェクトで使用）: `https://document.microcms.io/tutorial/` や `https://document.microcms.io/content-api/` 配下
- 画像フィールドの仕様: `https://document.microcms.io/manual/image-field`

### 接続情報（環境変数）

microCMS への接続には API キーが必要です。`.env` で設定します（`.env` は Git 管理外。雛形は `.env.example`）。

```
MICROCMS_SERVICE_DOMAIN=（サービスドメイン。https://<これ>.microcms.io）
MICROCMS_API_KEY=（APIキー）
```

クライアントの初期化と全 API 呼び出しは **[`src/lib/microcms.ts`](src/lib/microcms.ts) に集約**されています。microCMS 関連の処理を触るときは基本ここを見ます。

### microCMS の API（エンドポイント）

| エンドポイント | 用途 | 取得関数（`src/lib/microcms.ts`） | 使っているページ |
| --- | --- | --- | --- |
| `news` | 活動状況報告（記事） | `getAllPosts` / `getLatestPosts` / `getPostsByFiscalYear` / `getFiscalYears` | トップ、`/posts/`、`/category/[年度]/`、記事詳細 |
| `members` | 会員企業一覧 | `getAllMembers` | `/list/` |
| `pages` | 固定ページ本文 | `getPage(slug)` | ※ ヘルパーは用意済みだが**現状どのページからも未使用**（将来用） |

#### `news`（記事）の主なフィールド

`Post` 型（`src/lib/microcms.ts`）と CSV インポート列に対応します。`?` は任意項目で、microCMS 側に値があるときだけ記事ページに反映されます。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `title` | テキスト | 記事タイトル |
| `slug` | テキスト | URL の末尾（`/report/<slug>/`） |
| `body` | リッチエディタ | 本文HTML。`<h2>` などはサイト側で装飾（`PostLayout.astro` の `.post-body`） |
| `excerpt` | テキスト | リード文・一覧の抜粋 |
| `category` | セレクト | 既定 `report`。配列で返るため文字列に正規化（既定 `report` にフォールバック） |
| `publishedAt` | 日時 | 公開日（microCMS 自動付与） |
| `eyecatch` | 画像 | アイキャッチ（単一画像 = `MicroCMSImage`） |
| `subtitle?` | テキスト | サブタイトル |
| `eventDate?` | 日時 | 例会開催日（**年度区分の基準**。下記参照） |
| `reporter?` / `reporterCompany?` / `reporterBusiness?` | テキスト | 報告者・所属企業・事業内容（あれば報告者ボックス表示） |
| `thumbnail?` | 複数画像 | 記事下部のギャラリー（`MicroCMSImage[]`）。参考: image-field のドキュメント |

#### `members`（会員）のフィールド

`id` / `name` / `company` / `description` / `url` / `address`

---

## 3. 年度区分のロジック（重要な業務ルール）

記事のカテゴリは microCMS 上では一律 `report` で、**「○○年度」の区分はカテゴリではなく開催日から計算**します。

- 基準日 = `eventDate`（無ければ `publishedAt`）
- **年度は 5月〜翌4月**。1〜4月開催はその前年の年度扱い。
  - 例: 2024年3月開催の例会 → **2023年度**
- 実装: `getFiscalYear()` / `getFiscalYears()` / `getPostsByFiscalYear()`（`src/lib/microcms.ts`）

---

## 4. ディレクトリ構成

```
santama/                         ← Git リポジトリのルート
├── ARCHITECTURE.md              ← このファイル
├── astro.config.mjs             ← Astro 設定（site / base=/santama/ / Tailwind）
├── netlify.toml                 ← Netlify 用ビルド設定（※デプロイは GitHub Pages 主体。第6章）
├── tsconfig.json
├── package.json
├── .env / .env.example          ← microCMS の接続情報（.env は Git 管理外）
├── strip_tags.py                ← CSV インポート補助（第7章）
├── 活動状況報告_microcms_import*.csv  ← microCMS への記事一括投入用データ（第7章）
├── public/                      ← 静的アセット（画像・favicon 等。URL からは withBase 経由で参照）
└── src/
    ├── env.d.ts                 ← import.meta.env（microCMS の環境変数）の型
    ├── lib/
    │   ├── microcms.ts          ← ★ microCMS クライアント & 全 API 関数 & ナビ定義 & 年度ロジック
    │   ├── path.ts              ← withBase()（base パス付与。第5章）
    │   ├── date.ts              ← formatDate()（ISO → "2024年11月26日"）
    │   └── mockData.ts          ← ⚠️ レガシー（未使用）。microcms.ts に置換済み。使わない
    ├── layouts/
    │   ├── BaseLayout.astro     ← 全ページ共通の <html>/head/Header/Footer
    │   └── PostLayout.astro     ← 記事詳細のレイアウト（報告者ボックス・ギャラリー・本文装飾）
    ├── components/              ← Header, Footer, HeroSection, Breadcrumb, PostCard,
    │                              ContactForm, MemberTable, OrgChart, CheckList,
    │                              SectionHeading, FeatureCard, CTASection, ShareButtons
    ├── pages/                   ← ファイル＝ルート（第5章）
    └── styles/
        └── global.css          ← Tailwind 読み込み & @theme（配色トークン）& .prose/.post-body
```

---

## 5. ルーティング（`src/pages/` ＝ URL）

Astro はファイルパスがそのまま URL になります。`[...]` は動的ルートで、ビルド時に `getStaticPaths()` が microCMS の内容から URL を生成します。

| ファイル | URL | 内容 |
| --- | --- | --- |
| `index.astro` | `/` | トップ（ヒーロー、最新記事3件＝`news`） |
| `about.astro` | `/about/` | 三多摩支部とは |
| `event.astro` | `/event/` | 経営者の気づきとまなび |
| `our-services.astro` | `/our-services/` | 経営者支援サービス |
| `tokyo-doyu.astro` | `/tokyo-doyu/` | 東京中小企業家同友会 |
| `welcome.astro` | `/welcome/` | 入会案内 |
| `privacy.astro` | `/privacy/` | プライバシーポリシー |
| `list.astro` | `/list/` | 会員一覧（`members`） |
| `posts/index.astro` | `/posts/` | 活動状況の全記事一覧（年度フィルタ付き） |
| `category/[category].astro` | `/category/<年度>/` | **年度別**の記事一覧（例 `/category/2023/`） |
| `[category]/[slug].astro` | `/<category>/<slug>/` | **記事詳細**（category は通常 `report` → `/report/<slug>/`） |
| `contact/index.astro` | `/contact/` | お問い合わせフォーム |
| `contact/complete.astro` | `/contact/complete/` | 送信完了 |
| `404.astro` | （404） | Not Found |

> 紛らわしい点: ルートパラメータ名はどちらも `category` ですが、
> - `category/[category]/` の `[category]` は **年度（2023 など）**
> - `[category]/[slug]/` の `[category]` は **記事カテゴリ（report）**
> と意味が異なります。

### base パスの扱い（`withBase`）

サイトは `/santama/` 配下に公開されるため（`astro.config.mjs` の `base`）、**内部リンク・画像パスは必ず `withBase()`（`src/lib/path.ts`）で包みます**。

```astro
import { withBase } from '../lib/path';
<a href={withBase('/contact/')}>…</a>          // → /santama/contact/
<img src={withBase('/images/logo.png')} />     // → /santama/images/logo.png
```

ベタ書きの絶対パス（`/contact/` 等）はローカルでは動いても本番（`/santama/` 配下）で 404 になります。
※ microCMS から返る画像 URL（`eyecatch.url` 等）は完全な URL なので `withBase` は不要です。

### 配色トークン（`src/styles/global.css` の `@theme`）

`primary`（ブランドグリーン）/`accent`（ダークグリーン）/`cta`（ティール）など。
⚠️ 変数名 `--color-orange` は履歴上の名残で、**実際の色は緑**です（命名に惑わされないこと）。

---

## 6. セットアップ & 開発

```bash
npm install
cp .env.example .env     # → microCMS の SERVICE_DOMAIN / API_KEY を記入
npm run dev              # 開発サーバ（http://localhost:4321/santama/）
npm run build            # dist/ に静的ビルド
npm run preview          # ビルド結果のプレビュー
```

---

## 7. デプロイ

- **本番は GitHub Pages**。`master` の変更をビルドし、成果物を **`public` ブランチ**に積んで push する運用です。
  - この作業用に Claude Code スキル **`/deploy-public`** が用意されています（「master の変更をビルドして public ブランチに通常コミットで追加 push する」専用）。
- `netlify.toml` も同梱されていますが（`npm run build` → `dist` 公開）、現状の主たる公開先は上記 GitHub Pages です。
- ブランチ: 既定は `master`、デプロイ用が `public`。

---

## 8. microCMS へのデータ移行（CSV 一括インポート）

過去記事を microCMS に一括投入するための資材がリポジトリ直下にあります。

- `活動状況報告_microcms_import*.csv` … microCMS のインポート用 CSV。列が `news` API のフィールド（`title`, `subtitle`, `eventDate`, `reporter…`, `excerpt`, `body`, `eyecatch`, `category`, `slug`, `thumbnail`）に対応。
- `strip_tags.py` … `body` 列から `<p>` / `<img>` タグを除去する整形スクリプト。
- `tools/` … 画像アップロード & CSV 内の画像 URL 差し替え用スクリプト群（`.gitignore` 済み）。

CSV 内の `category` 列に `news2023` 等の旧値が残っていますが、これは初期インポート時の名残です。**現行の設計は「カテゴリ＝`report` 固定 ＋ 年度は開催日から算出」**（第3章）なので、現状の仕様はコード（`src/lib/microcms.ts`）を正としてください。

---

## 9. 新しく触る人向けの注意点（まとめ）

1. **記事・会員は microCMS。** コードを直さず管理画面で編集。仕様は `https://document.microcms.io/` 配下を参照。
2. **microCMS 連携は `src/lib/microcms.ts` に集約。** API 追加・変更はまずここ。
3. **内部リンク/画像は `withBase()` で包む。** 直書き絶対パスは本番で 404。
4. **年度は開催日（`eventDate`）から算出。** カテゴリ文字列ではない。5月〜翌4月。
5. **`src/lib/mockData.ts` は使わない**（レガシー）。
6. **`--color-orange` は緑**（命名の名残）。
7. 現在 `noindex`（テスト公開中）。本番公開時に `BaseLayout.astro` の robots メタを外す。
