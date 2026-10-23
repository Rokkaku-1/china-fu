"use client";
import {useEffect,useState} from 'react';
import InfoIcon from './info-icon';
import type {Branch} from '@/lib/types';
import {restaurantStatus,weekDays,safeMapsUrl,contactNumber,validHours} from '@/lib/restaurant-info';
export default function RestaurantInfo({branches,branchId,onSelect}: {branches:Branch[];branchId:string;onSelect:(id:string)=>void}) {
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{setNow(new Date());const timer=setInterval(()=>setNow(new Date()),30000);const update=()=>setNow(new Date());document.addEventListener('visibilitychange',update);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',update);};},[]);
 const branch=branches.find(b=>b.id===branchId);
 const status=now?restaurantStatus(branch?.opening_hours,branch?.temporarily_closed,now):{state:'unknown',text:'Consultando horario…'};
 const address=branch?.address && !/por confirmar|referencia/i.test(branch.address)?branch.address:null;
 const map=safeMapsUrl(branch?.maps_url) || (address?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address):null);
 const hours=validHours(branch?.opening_hours)?branch.opening_hours:[];
 return <div className="restaurant-info">
  <label>Local<select value={branchId} onChange={e=>onSelect(e.target.value)}>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
  <p className={'restaurant-status restaurant-status--'+status.state} role="status">{status.text}</p>
  <dl>
   <div><dt><InfoIcon kind="location"/>Ubicación</dt><dd>{map?<a href={map} target="_blank" rel="noopener noreferrer">{address || 'Ver ubicación en Google Maps'} ↗</a>:'Dirección por confirmar.'}</dd></div>
   <div><dt><InfoIcon kind="phone"/>Contacto</dt><dd>{branch?.phone?<a href={'tel:+'+contactNumber(branch.phone)}>{branch.phone}</a>:'Teléfono por confirmar.'}{branch?.whatsapp&&<a className="restaurant-whatsapp" href={'https://wa.me/'+contactNumber(branch.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}</dd></div>
   <div><dt><InfoIcon kind="clock"/>Horarios · Lima</dt><dd>{hours.length?<ul className="restaurant-hours">{[1,2,3,4,5,6,0].map(day=>{const p=hours.find(h=>h.day===day);return <li key={day}><span>{weekDays[day]}</span><span>{p?p.open+'–'+p.close+(p.close<p.open?' (+1 día)':''):'Cerrado'}</span></li>;})}</ul>:'Horarios por confirmar.'}</dd></div>
  </dl>
 </div>;
}
