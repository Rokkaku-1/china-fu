import type {Combo,Product,Variant} from './types';
export const COMBO_CATEGORY_ID='80000000-0000-4000-8000-000000000001';
export const money=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n);
export function comboProducts(products:Product[],combos:Combo[]):Product[]{
 const metrics=new Map(products.map(p=>[p.id,p]));
 return [...products.filter(p=>p.category_id!==COMBO_CATEGORY_ID),...combos.filter(c=>c.active).map(c=>({id:c.id,name:c.name,description:[c.description,'Incluye: '+(c.included_names||[]).join(' + ')].filter(Boolean).join(' · '),category_id:COMBO_CATEGORY_ID,price:Number(c.price),image_url:c.image_url,is_demo:!!c.is_demo,active:c.active,sort_order:c.sort_order,created_at:c.created_at,order_count:metrics.get(c.id)?.order_count??0,combo:c}))];
}
export function comboSelection(productIds:string[],variantIds:(string|null)[],products:Product[],variants:Variant[]){
 return productIds.map((id,i)=>{const p=products.find(p=>p.id===id),options=variants.filter(v=>v.product_id===id&&v.active),v=options.find(v=>v.id===variantIds[i]);return {product:p,variant:v,name:(p?.name||'Plato no disponible')+(v?' · '+v.name:''),price:Number(v?.price??p?.price??0),valid:!!p?.active&&p.category_id!==COMBO_CATEGORY_ID&&(options.length?!!v:!variantIds[i])};});
}
export function comboDiscount(price:number,regular:number){return Math.max(0,Math.round((regular-price)*100)/100);}
