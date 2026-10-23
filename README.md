# China Fu · Entrega de diseño web

Frontend de referencia en Next.js/React. Mantiene la propuesta visual oriental, catálogo, imágenes, filtros, paginación, favoritos y carrito de demostración. No incluye Supabase, credenciales, API, registro, administración, recepción de pedidos, facturación ni pagos.

## Vista sin instalar herramientas

La carpeta sitio-estatico contiene la web compilada. Subir su contenido a un hosting estático o servirlo por HTTP. No abrir index.html directamente con file://: las rutas de imágenes y scripts parten de la raíz del sitio.

## Desarrollo

Requiere Node.js 20.9 o superior. Ejecutar npm ci, npm run dev y abrir http://localhost:4181. npm run typecheck revisa tipos; npm run build genera out/. No hace falta configurar variables de entorno ni una base de datos.

## Integración del cliente

Su sitio actual usa Flutter Web. Este código React sirve como referencia visual y no es un tema que se pueda instalar directamente en Flutter. Su desarrollador debe reproducir los componentes en Dart o integrar este frontend a sus APIs. La integración, publicación en producción, contenido definitivo y lógica comercial se acuerdan por separado.

## Archivos

app/: página y estilos; components/: interfaz; lib/: funciones visuales; data/catalog.json: catálogo local referencial; public/: imágenes. El catálogo contiene 141 registros capturados de la web oficial el 4 de octubre de 2026. Precios, disponibilidad, horarios y direcciones deben confirmarse con el negocio.

Los favoritos y la selección se conservan únicamente en el navegador. El resumen final no crea pedidos. Ver RECURSOS-Y-LICENCIAS.md y ENTREGA.md antes de publicar comercialmente.
