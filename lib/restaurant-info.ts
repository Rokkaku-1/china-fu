export type OpeningPeriod = {day:number;open:string;close:string};
export const weekDays = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const clock = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const minutes = (value:string) => Number(value.slice(0,2))*60+Number(value.slice(3));
export function validHours(value:unknown): value is OpeningPeriod[] {
 return Array.isArray(value) && value.length<=7 && value.every(p=>p && Number.isInteger(p.day) && p.day>=0 && p.day<=6 && typeof p.open==='string' && typeof p.close==='string' && clock.test(p.open) && clock.test(p.close) && p.open!==p.close) && new Set(value.map(p=>p.day)).size===value.length;
}
export function restaurantStatus(hours:unknown, temporarilyClosed=false, now=new Date()) {
 if(temporarilyClosed) return {state:'closed',text:'Cerrado temporalmente'};
 if(!validHours(hours) || !hours.length) return {state:'unknown',text:'Horario por confirmar'};
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Lima',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const get=(type:string)=>parts.find(p=>p.type===type)?.value || '';
 const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));
 const current=day*1440+Number(get('hour'))*60+Number(get('minute'));
 for(const p of hours) {
  const start=p.day*1440+minutes(p.open),end=p.day*1440+minutes(p.close)+(minutes(p.close)<minutes(p.open)?1440:0);
  for(const shift of [-10080,0,10080]) if(current>=start+shift && current<end+shift) {
   const remaining=end+shift-current;
   return {state:'open',text:remaining<=60?'Cierra en '+remaining+' '+(remaining===1?'minuto':'minutos'):'Abierto ahora'};
  }
 }
 return {state:'closed',text:'Cerrado ahora'};
}
export function formatOpeningHours(value:unknown) {
 if(!validHours(value) || !value.length) return 'Por confirmar con el local.';
 return [...value].sort((a,b)=>(a.day||7)-(b.day||7)).map(p=>weekDays[p.day]+': '+p.open+'–'+p.close+(p.close<p.open?' (día siguiente)':'')).join(' · ');
}
export function safeMapsUrl(value:string | undefined) {
 try {const u=new URL(value || '');return u.protocol==='https:' && (u.hostname==='maps.app.goo.gl' || u.hostname==='maps.google.com' || (['google.com','www.google.com','goo.gl'].includes(u.hostname) && u.pathname.startsWith('/maps'))) ? u.href : null;} catch {return null;}
}
export function contactNumber(value:string | undefined) {
 const digits=(value || '').replace(/[^0-9]/g,'');return digits.length===9?'51'+digits:digits;
}
export function readRestaurantFields(form:FormData) {
 const phone=String(form.get('phone')||'').trim(),whatsapp=String(form.get('whatsapp')||'').trim(),maps_url=String(form.get('maps_url')||'').trim();
 if([phone,whatsapp].some(n=>n && (!/^\+?[0-9 ()-]{7,24}$/.test(n) || contactNumber(n).length<7 || contactNumber(n).length>15))) throw Error('Revisa el teléfono y WhatsApp. Usa números con código de país.');
 if(maps_url && !safeMapsUrl(maps_url)) throw Error('Usa un enlace https de Google Maps.');
 const opening_hours:OpeningPeriod[]=[];
 for(let day=0;day<7;day++) if(form.get('day-'+day)==='on') opening_hours.push({day,open:String(form.get('open-'+day)||''),close:String(form.get('close-'+day)||'')});
 if(!validHours(opening_hours)) throw Error('Completa apertura y cierre para cada día marcado. Deben ser horas distintas.');
 return {phone,whatsapp,maps_url,opening_hours,temporarily_closed:form.get('temporarily_closed')==='on'};
}
