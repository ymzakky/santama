/**
 * microCMSのISO日時文字列 (例: "2024-11-26T09:30:00.000Z") を
 * "2024年11月26日" 形式に整形する。
 * 文字列が空・不正な場合は空文字列を返す。
 */
export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
