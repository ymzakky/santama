export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path.slice(1) : path}`;
}

// 画像 URL を解決する。
// microCMS の絶対 URL (http/https) はそのまま、ローカルの公開パス (/images/...) には
// base パスを付与する。会員紹介の画像が静的→microCMS のどちらでも動くようにするためのヘルパー。
export function resolveAssetUrl(src: string): string {
  if (!src) return src;
  return /^https?:\/\//.test(src) ? src : withBase(src);
}
