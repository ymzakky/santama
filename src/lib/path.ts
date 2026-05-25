export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path.slice(1) : path}`;
}
