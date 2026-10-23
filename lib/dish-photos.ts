import sources from '@/data/photo-sources.json';
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
/** Stock images are illustrative; an administrator's own image always takes priority. */
export function getDishPhoto(name: string, category: string) {
 const n = normalize(name), c = normalize(category);
 let key = 'mixto';
 if (/bebida|bebidas/.test(c)) {
  key = /cafe/.test(n) ? 'cafe' : /caliente/.test(c) ? 'te' : /agua/.test(n) ? 'agua' : /cerveza/.test(n) ? 'cerveza' : /limonada/.test(n) ? 'limonada' : /chicha/.test(n) ? 'bebida-morada' : 'gaseosa';
 } else if (/sopa/.test(c)) key = 'sopa';
 else if (/combinad|combinacion|aeropuerto/.test(c)) key = /aeropuerto/.test(c) ? 'tallarin-verduras' : 'chaufa-pollo';
 else if (/tortilla/.test(c)) key = 'tortilla';
 else if (/alita/.test(c)) key = 'alitas';
 else if (/langostino/.test(c)) key = /fideo|tallarin/.test(n) ? 'tallarin' : 'langostinos';
 else if (/lomo|carnes? de res/.test(c)) key = 'res';
 else if (/carne de chancho/.test(c)) key = 'chancho';
 else if (/arroz blanco/.test(n)) key = 'arroz-blanco';
 else if (/wantan frito/.test(n)) key = 'wantan';
 else if (/chicharron|chijaukay|tipakay|enr?rollado/.test(n)) key = 'pollo-crujiente';
 else if (/chaufa/.test(n + ' ' + c)) key = /pollo/.test(n) ? 'chaufa-pollo' : 'chaufa';
 else if (/tallarin|fideo/.test(n + ' ' + c)) key = /verdura/.test(n) ? 'tallarin-verduras' : 'tallarin';
 else if (/pollo/.test(n + ' ' + c)) key = 'pollo';
 const source = sources.sources.find(s => s.key === key)!;
 return { src: '/photos/' + key + '-800.webp', srcSet: '/photos/' + key + '-400.webp 400w, /photos/' + key + '-800.webp 800w', alt: 'Fotografía referencial de ' + source.alt, key };
}
