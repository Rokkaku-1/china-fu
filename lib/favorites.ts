export const FAVORITES_KEY = 'chinafu-favorites-v1';
export function readFavoriteIds(raw: string | null): string[] {
 try {
  const value: unknown = JSON.parse(raw || '[]');
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 128))] : [];
 } catch { return []; }
}
export function toggleFavoriteId(ids: string[], id: string): string[] {
 return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
}
