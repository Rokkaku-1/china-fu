# Verificación de la demo

Revisión local: 4 de octubre de 2026.

- TypeScript y exportación estática de Next.js correctos.
- Revisados escritorio de 1440 px y móvil de 390 px; sin desbordamiento horizontal en esas vistas.
- Verificados agregado al carrito, cantidades, subtotal y resumen sin crear pedidos.
- Favorito guardado conservado tras recargar, búsqueda, cambio de categoría, orden por precio persistente entre categorías y paginación.
- No incluye SDK de Supabase, rutas API, administración, credenciales ni variables de entorno.
- Los 141 productos usan imágenes locales referenciales; fuentes de Pexels registradas.

No es una auditoría de todos los navegadores o dispositivos. Datos definitivos, derechos de marca e integración con Flutter requieren revisión del cliente. Popularidad y novedades se muestran deshabilitadas porque no hay métricas reales; no se inventan ofertas.

5 de octubre: la promoción flotante inyectada por Netlify Drop tapaba el botón Pedido en móvil. Se oculta únicamente en pantallas de hasta 760 px para permitir usar el carrito. El carrito fue comprobado en el enlace publicado mediante el botón superior.
