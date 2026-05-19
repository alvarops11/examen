# Cambios AdSense Fase 1 (SEO tecnico)

Fecha: 2026-05-19

## Objetivo

Reducir riesgo de rechazo en AdSense por indexacion de rutas sin valor, paginas de error indexables y senales de contenido "en construccion".

## Archivos modificados

- `client/src/components/SEO.tsx`
- `client/src/pages/NotFound.tsx`
- `client/src/pages/Estadisticas.tsx`
- `client/public/robots.txt`
- `client/src/pages/Blog.tsx`
- `worker/src/index.ts`
- `scripts/postbuild-static-routes.mjs`

## Cambios aplicados

1. Control de indexacion por pagina en SEO
- Se anadio la prop `noindex` al componente SEO.
- Si `noindex` es `true`, se inyecta `meta robots` con `noindex,follow,max-image-preview:large`.
- Si `noindex` es `false`, se mantiene `index,follow,max-image-preview:large`.

2. Paginas marcadas como no indexables
- `NotFound` (`/404` y fallback visual) ahora usa `noindex`.
- `Estadisticas` (`/estadisticas`) ahora usa `noindex`.

3. Robots.txt endurecido para rutas tecnicas
- Se anadieron:
  - `Disallow: /api/`
  - `Disallow: /404`
  - `Disallow: /estadisticas`

4. Senal "under construction" eliminada del blog
- Se reemplazo el copy "Proximamente" por un CTA funcional de suscripcion informativa.
- Se cambio texto del bloque para evitar sensacion de pagina incompleta.

5. Blindaje adicional de API para crawlers
- Se agrego helper `apiHeaders(...)` en el worker.
- Respuestas API principales devuelven `X-Robots-Tag: noindex, nofollow`.
- Incluye endpoints de stats, track, tutor y metodo no permitido.
- El endpoint SSE de generacion tambien devuelve `X-Robots-Tag: noindex, nofollow`.

6. Rutas estaticas ampliadas para GitHub Pages
- Se incluyo `/estadisticas` en la lista de rutas estaticas post-build.
- Objetivo: evitar entrada inicial por `404.html` en una ruta valida de la SPA.

7. 404 de build desacoplado de la SPA
- `scripts/postbuild-static-routes.mjs` ya no copia `index.html` a `404.html`.
- Ahora genera un `404.html` estatico dedicado con `noindex`.
- Objetivo: reducir riesgo de soft-404 indexable por contenido SPA en URLs inexistentes.

8. Metadatos SEO por ruta en HTML estatico
- El postbuild ahora genera cada `index.html` de ruta con:
  - `og:url` especifico de la URL
  - `canonical` especifico de la URL
- En `/estadisticas`, el HTML estatico se genera con `meta robots noindex`.
- Objetivo: no depender unicamente de hidratacion JS para señales SEO basicas.

## Riesgos / limitaciones

- Sigue pendiente validar en produccion que cada URL publica responda con estado HTTP esperado (200 en validas, 404 en inexistentes).
- Aunque se genero 404 estatico dedicado, la confirmacion final debe hacerse con verificacion HTTP real en dominio.

## Como probar

1. Revisar HTML en navegador:
- `/404` y `/estadisticas` deben exponer `meta[name="robots"]` con `noindex`.

2. Revisar robots:
- `https://examsphere.me/robots.txt` debe incluir `Disallow: /api/` y `Disallow: /404`.

3. Revisar cabecera API:
- Endpoint `/api/stats` debe devolver `X-Robots-Tag: noindex, nofollow`.

4. Revisar blog:
- En `/blog`, el CTA ya no debe mostrar "Proximamente".
