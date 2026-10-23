export type Combo = {
 id:string;name:string;description:string;price:number;product_ids:string[];variant_ids:(string|null)[];image_url:string|null;active:boolean;featured:boolean;created_at:string;sort_order:number;normal_price?:number;included_names?:string[];image_name?:string;image_category?:string;is_demo?:boolean;
};
export type Product = {
  combo?:Combo;
  created_at?: string | null;
  order_count?: number;
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_demo: boolean;
  active: boolean;
  sort_order: number;
};
export type Category = {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
};
export type Branch = {
  phone?: string;
  whatsapp?: string;
  maps_url?: string;
  opening_hours?: import('./restaurant-info').OpeningPeriod[];
  temporarily_closed?: boolean;
  id: string;
  name: string;
  address: string;
  active: boolean;
  delivery_enabled: boolean;
  delivery_fee: number;
  is_demo: boolean;
};
export type Variant = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  active: boolean;
};
export type CartItem = {
  product_id: string;
  variant_id: string | null;
  quantity: number;
};
export type Faq = {id:string;question:string;answer:string;sort_order:number;active:boolean};
export type DeliveryZone = {id:string;branch_id:string;name:string;fee:number;description:string;active:boolean;created_at:string};
export type Catalog = {
 deliveryZones?:DeliveryZone[];
 zonesReady?:boolean;
  combos?:Combo[];
  combosReady?:boolean;
  faqs?: Faq[];
  faqReady?: boolean;
  sortMetricsReady?: boolean;
  products: Product[];
  categories: Category[];
  branches: Branch[];
  variants: Variant[];
  paymentsReady?: boolean;
  connected: boolean;
  message: string;
};