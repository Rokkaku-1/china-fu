import type { Product, Variant } from './types';
export type CatalogSort = 'catalog' | 'popular' | 'price-asc' | 'price-desc' | 'recent';
export function sortCatalog(products: Product[], variants: Variant[], order: CatalogSort) {
 if (order === 'catalog') return [...products];
 const prices = new Map<string,number>();
 for (const v of variants) if (v.active) prices.set(v.product_id, Math.min(prices.get(v.product_id) ?? Infinity, Number(v.price)));
 const price = (p: Product) => prices.get(p.id) ?? Number(p.price);
 const date = (p: Product) => p.created_at ? Date.parse(p.created_at) || 0 : 0;
 return [...products].sort((a,b) => {
  const difference = order === 'price-asc' ? price(a)-price(b) : order === 'price-desc' ? price(b)-price(a) : order === 'popular' ? (b.order_count ?? 0)-(a.order_count ?? 0) : date(b)-date(a);
  return difference || a.sort_order-b.sort_order || a.name.localeCompare(b.name,'es') || a.id.localeCompare(b.id);
 });
}
