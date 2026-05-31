import { createClient } from 'microcms-js-sdk';
import type { MicroCMSImage, MicroCMSListResponse } from 'microcms-js-sdk';
import { memberProfilesStatic } from '../data/members';

// microCMS client
const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

// ---------- Types ----------

export interface Post {
  id: string;
  title: string;
  slug: string;
  eyecatch?: MicroCMSImage;
  body: string;
  category: string;
  publishedAt: string;
  excerpt: string;
  // ---- 以下は microCMS 側に追加してもらえれば自動で記事ページに反映される追加フィールド (全て optional) ----
  subtitle?: string;           // サブタイトル例: "～一人ひとりが輝ける会社づくりの理念とその実践～"
  eventDate?: string;          // 例会開催日 (公開日と別管理する場合)
  reporter?: string;           // 報告者名 例: "山田 太郎 氏"
  reporterCompany?: string;    // 報告者の所属企業 例: "(株)ボンズシップ"
  reporterBusiness?: string;   // 報告者の業種・事業内容 例: "訪問看護サービス事業"
  // microCMS の「複数画像」フィールド。API は MicroCMSImage の配列 ([{url,width,height}, ...]) で返る。
  // 参考: https://document.microcms.io/manual/image-field
  thumbnail?: MicroCMSImage[]; // 記事下部のギャラリー表示用 (複数画像)
}

// 会員紹介（インタビュー記事）。広報部のインタビュー様式に対応する。
// 現状は静的データ (src/data/members.ts) で運用し、将来 microCMS の
// `member-profiles` エンドポイントへ移行する想定（getAllMemberProfiles 参照）。
export interface MemberProfile {
  id: string;
  slug: string;          // URL 末尾（/members/<slug>/）
  company: string;       // 会社名
  name: string;          // 氏名
  position?: string;     // 役職（例: 代表取締役）
  business: string;      // 業種・事業内容
  location: string;      // 会社所在地 又はお住まい
  doyuHistory: string;   // 同友会歴 / 入会年月（例: "12年目（2018-2021年 支部長）"）
  reason: string[];      // 5. 同友会入会のきっかけ（段落配列）
  good: string[];        // 6. 入ってよかったこと・印象に残っていること
  impact: string[];      // 7. 入会で自社の事業が変わったこと・影響
  interviewDate?: string;// インタビュー記入日（ISO 文字列）
  interviewer?: string;  // 担当（広報部）
  // 画像は microCMS 移行を見据え MicroCMSImage 互換の形で持つ。
  // 静的運用では url にローカル公開パス（例: /images/members/xxx-face.jpg）を入れる。
  faceImage?: ProfileImage;     // 顔写真
  exteriorImage?: ProfileImage; // 会社事務所の外観
  gallery?: ProfileImage[];     // その他の写真
}

// MicroCMSImage 互換の画像参照（url は絶対 URL でもローカルパスでも可）。
export interface ProfileImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  body: string;
  metaDescription?: string;
  ogImage?: MicroCMSImage;
}

// ---------- Static data ----------

// ---------- Category / fiscal year ----------

// 記事カテゴリは microCMS 上では一律 "report"。
// 年度区分は開催日 (eventDate / 無ければ publishedAt) から算出する。
// 年度は 5月～翌4月（年度末は4月）。例: 2024-03 開催の例会は「2023年度」。

export function getFiscalYear(post: { eventDate?: string; publishedAt: string }): number {
  const iso = post.eventDate || post.publishedAt;
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  return month <= 4 ? year - 1 : year;
}

export function getFiscalYearLabel(year: number | string): string {
  return `${year}年度のお知らせ`;
}

export const navItems = [
  { label: 'Top', href: '/' },
  { label: '三多摩支部とは', href: '/about/' },
  { label: '経営者の気づきとまなび', href: '/event/' },
  { label: '経営者支援サービス', href: '/our-services/' },
  { label: '最新活動状況', href: '/posts/' },
  { label: '会員紹介', href: '/members/' },
  { label: '東京中小企業家同友会', href: '/tokyo-doyu/' },
];

export const footerNavItems = [
  ...navItems,
  { label: '入会案内', href: '/welcome/' },
  { label: 'お問い合わせ', href: '/contact/' },
];

// ---------- Helpers ----------

// 記事カテゴリの既定値（microCMS 上の選択肢）。
export const DEFAULT_CATEGORY = 'report';

// microCMS のセレクトフィールドは配列 (例: ["report"]) で返るため文字列へ正規化する。
// 未設定の場合は既定カテゴリ "report" にフォールバックする。
function normalizeCategory(raw: unknown): string {
  const val = Array.isArray(raw) ? raw[0] : raw;
  return typeof val === 'string' && val ? val : DEFAULT_CATEGORY;
}

function normalizePost(post: Post): Post {
  return { ...post, category: normalizeCategory(post.category) };
}

function eventTime(post: Post): number {
  return new Date(post.eventDate || post.publishedAt).getTime();
}

// 開催日 (eventDate / 無ければ publishedAt) の新しい順に並べ替える。
function sortByEventDateDesc(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => eventTime(b) - eventTime(a));
}

// ---------- API functions ----------

export async function getAllPosts(): Promise<Post[]> {
  const res = await client.getList<Post>({
    endpoint: 'news',
    queries: { limit: 100 },
  });
  return sortByEventDateDesc(res.contents.map(normalizePost));
}

// 指定した年度（開催日基準）の記事のみを返す。
export async function getPostsByFiscalYear(year: number): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((post) => getFiscalYear(post) === year);
}

// 記事が存在する年度の一覧を新しい順で返す。
export async function getFiscalYears(): Promise<number[]> {
  const all = await getAllPosts();
  const years = [...new Set(all.map(getFiscalYear))];
  return years.sort((a, b) => b - a);
}

export async function getLatestPosts(count: number): Promise<Post[]> {
  const all = await getAllPosts();
  return all.slice(0, count);
}

// 会員紹介の取得。
// 【現状】静的データ (src/data/members.ts) を返す。
// 【将来】microCMS に `member-profiles` エンドポイントを用意したら、下記コメントの
//        実装に差し替えるだけで移行できる（画像は MicroCMSImage が ProfileImage 互換）。
//
//   export async function getAllMemberProfiles(): Promise<MemberProfile[]> {
//     const res = await client.getList<MemberProfile>({
//       endpoint: 'member-profiles',
//       queries: { limit: 100 },
//     });
//     return res.contents;
//   }
export async function getAllMemberProfiles(): Promise<MemberProfile[]> {
  return memberProfilesStatic;
}

export async function getMemberProfile(slug: string): Promise<MemberProfile | undefined> {
  const all = await getAllMemberProfiles();
  return all.find((m) => m.slug === slug);
}

export async function getPage(slug: string): Promise<Page | undefined> {
  const res = await client.getList<Page>({
    endpoint: 'pages',
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  });
  return res.contents[0];
}
