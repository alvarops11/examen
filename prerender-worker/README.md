# ExamSphere Prerender Worker

Este worker pone `Prerender.io` delante de la SPA solo para bots y agentes de lectura, dejando a los usuarios normales en el flujo actual.

## Qué hace

- Detecta buscadores, bots sociales y varios agentes de IA.
- Pide a `Prerender.io` una versión HTML ya renderizada.
- Si algo falla, deja pasar la petición normal a la web.

## Variables necesarias

- `PRERENDER_TOKEN` (secret): token de Prerender.io.
- `PRERENDER_HOSTS`: hosts públicos donde debe activarse.
- `PRERENDER_SERVICE_URL`: por defecto `https://service.prerender.io`.

## Cómo activarlo más adelante

1. Crear el worker en Cloudflare o desplegar este directorio con Wrangler.
2. Añadir el secret:
   - `wrangler secret put PRERENDER_TOKEN`
3. Configurar la ruta en Cloudflare:
   - `examsphere.me/*`
   - `www.examsphere.me/*`
4. Poner el modo de fallo como `Fail open / proceed`.
5. Verificar que el dominio esté realmente proxied por Cloudflare.
6. En el panel del dominio, revisar la opción de `Control AI crawlers` para no bloquear los bots que quieras servir.
7. Desactivar `Automatic Signed Exchanges (SXG)` si aparece activo en Cloudflare, tal y como recomienda Prerender.io.

## Qué no cambia

- No sustituye el frontend actual.
- No toca el worker de generación de exámenes.
- No despliega nada por sí solo.

## Verificación recomendada

Cuando quieras activarlo, comprobar:

- HTML normal de usuario: sigue sirviendo la SPA.
- HTML para bot: incluye contenido ya renderizado.
- URLs clave:
  - `/`
  - `/faq`
  - `/como-funciona`
  - `/blog`
  - artículos del blog
  - `/sobre-nosotros`

## Referencias oficiales

- Prerender.io Cloudflare integration:
  - https://docs.prerender.io/docs/cloudflare-integration-v2
- Worker de ejemplo oficial:
  - https://github.com/prerender/prerender-cloudflare-worker
