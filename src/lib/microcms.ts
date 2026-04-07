import { createClient } from 'microcms-js-sdk';
import type { MicroCMSImage, MicroCMSListResponse } from 'microcms-js-sdk';

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
}

export interface Member {
  id: string;
  name: string;
  company: string;
  description: string;
  url: string;
  address: string;
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

export const categoryLabels: Record<string, string> = {
  news2022: '2022',
  news2023: '2023',
  news2024: '2024',
  news2025: '2025',
};

export const categoryFullLabels: Record<string, string> = {
  news2022: '2022年度のお知らせ',
  news2023: '2023年度のお知らせ',
  news2024: '2024年度のお知らせ',
  news2025: '2025年度のお知らせ',
};

export function getCategoryLabel(category: string): string {
  return categoryFullLabels[category] || category;
}

export const categories = ['news2025', 'news2024', 'news2023', 'news2022'];

export const navItems = [
  { label: 'トップ', href: '/' },
  { label: '三多摩支部とは', href: '/about/' },
  { label: '経営者の気づきとまなび', href: '/posts/' },
  { label: '経営者支援サービス', href: '/our-services/' },
  { label: 'イベント', href: '/event/' },
  { label: '会員企業一覧', href: '/list/' },
  { label: '東京同友会', href: '/tokyo-doyu/' },
];

export const footerNavItems = [
  ...navItems,
  { label: '入会案内', href: '/welcome/' },
  { label: 'お問い合わせ', href: '/contact/' },
];

// ---------- API functions ----------

export async function getAllPosts(): Promise<Post[]> {
  const res = await client.getList<Post>({
    endpoint: 'news',
    queries: { limit: 100, orders: '-publishedAt' },
  });
  return res.contents;
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const res = await client.getList<Post>({
    endpoint: 'news',
    queries: {
      limit: 100,
      filters: `category[equals]${category}`,
      orders: '-publishedAt',
    },
  });
  return res.contents;
}

export async function getLatestPosts(count: number): Promise<Post[]> {
  const res = await client.getList<Post>({
    endpoint: 'news',
    queries: { limit: count, orders: '-publishedAt' },
  });
  return res.contents;
}

export async function getAllMembers(): Promise<Member[]> {
  const res = await client.getList<Member>({
    endpoint: 'members',
    queries: { limit: 100 },
  });
  return res.contents;
}

export async function getPage(slug: string): Promise<Page | undefined> {
  const res = await client.getList<Page>({
    endpoint: 'pages',
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  });
  return res.contents[0];
}
