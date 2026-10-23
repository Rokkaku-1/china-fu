"use client";
import { useState } from 'react';
import { getDishPhoto } from '@/lib/dish-photos';
type Props = { name: string; category: string; imageUrl: string | null };
export default function DishPhoto({ name, category, imageUrl }: Props) {
 const [failedUrl, setFailedUrl] = useState<string | null>(null);
 const stock = getDishPhoto(name, category);
 const ownImage = Boolean(imageUrl && /^https:\/\//.test(imageUrl) && failedUrl !== imageUrl);
 const src = ownImage ? imageUrl! : stock.src;
 return <div className="dish-photo-frame">
  <img className="dish-photo" src={src} srcSet={ownImage ? undefined : stock.srcSet}
   sizes={ownImage ? undefined : '(max-width: 760px) calc(100vw - 48px), (max-width: 1100px) 35vw, 440px'}
   alt={ownImage ? name : stock.alt} width={800} height={450} loading="lazy" decoding="async"
   onError={() => { if (ownImage) setFailedUrl(imageUrl); }} />
  {!ownImage && <span className="dish-photo-caption">Imagen referencial</span>}
 </div>;
}
