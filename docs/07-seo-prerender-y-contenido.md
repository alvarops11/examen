# 07 - SEO, Prerender y Contenido Publico

## 1. Contexto SEO del proyecto

ExamSphere es una SPA. Sin medidas extra, muchos bots ven un shell vacio o rutas con comportamiento suboptimo.

Para corregir esto se incorporo:
- sitemap y robots en `client/public/`
- worker de prerender/fallback para bots y rutas publicas

## 2. Archivos SEO en frontend

Ubicacion: `client/public/`
- `robots.txt`
- `sitemap.xml`
- `sitemap-pages.xml`
- `ads.txt`
- assets OG (imagenes para previews)

Objetivo:
- mejorar rastreo y descubrimiento de rutas publicas.

## 3. Worker de prerender

Directorio:
- `prerender-worker/`

Archivos:
- `prerender-worker/src/index.ts`
- `prerender-worker/wrangler.toml`
- `prerender-worker/README.md`

Rol:
1. Detectar bots/crawlers.
2. Pedir renderizado a servicio prerender.
3. Devolver HTML util para rastreo.
4. Aplicar fallback SPA para rutas publicas cuando haga falta.

## 4. Rutas de contenido clave para rastreo

Rutas que deben mantenerse vivas y enlazadas:
- `/`
- `/como-usar`
- `/faq`
- `/contacto`
- `/sobre-nosotros`
- `/blog`
- posts de blog
- legales: `/aviso-legal`, `/privacidad`, `/cookies`

## 5. ads.txt y monetizacion

Archivo:
- `client/public/ads.txt`

Debe estar accesible en:
- `/ads.txt`

Validacion minima:
- HTTP 200
- contenido correcto de publisher.

## 6. Buenas practicas operativas SEO

1. Cada nueva pagina publica debe:
   - tener ruta estable
   - estar enlazada internamente
   - entrar en sitemap

2. Evitar bloques huertanos:
   - todo contenido nuevo debe tener enlaces de ida y vuelta.

3. Revisar periodicamente:
   - respuesta HTTP real de rutas
   - contenido que recibe bot (no solo navegador humano).

4. Mantener consistencia de copy:
   - claims verificables y sin cifras no sustentadas.

