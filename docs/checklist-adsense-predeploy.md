# Checklist Predeploy AdSense (GitHub Pages)

Fecha: 2026-05-19
Dominio: `https://examsphere.me`
Estado: validacion preproduccion (sin despliegue ejecutado)

## 1) Matriz de URLs objetivo

### Indexables y en sitemap
- `/`
- `/blog`
- `/blog/tecnicas-estudio`
- `/blog/ia-educacion`
- `/blog/preparar-oposiciones-ia`
- `/blog/reducir-ansiedad-examenes`
- `/blog/como-estudiar-temarios-largos`
- `/blog/errores-frecuentes-tipo-test`
- `/blog/organizar-semana-examenes`
- `/blog/como-tomar-mejores-apuntes`
- `/sobre-nosotros`
- `/como-usar`
- `/faq`
- `/contacto`
- `/aviso-legal`
- `/privacidad`
- `/cookies`

Esperado:
- HTTP `200`
- contenido util
- title/description/canonical coherentes

### No indexables
- `/404`
- `/estadisticas`
- `/api/stats`
- `/api/track-visit`
- `/api/track-event`
- `/api/tutor-error`

Esperado:
- fuera de sitemap
- bloqueadas por robots cuando aplique
- `X-Robots-Tag: noindex, nofollow` en API

## 2) Verificaciones HTTP al publicar

Ejecutar tras deploy (ejemplos PowerShell):

```powershell
curl.exe -I https://examsphere.me/
curl.exe -I https://examsphere.me/blog
curl.exe -I https://examsphere.me/blog/tecnicas-estudio
curl.exe -I https://examsphere.me/sobre-nosotros
curl.exe -I https://examsphere.me/como-usar
curl.exe -I https://examsphere.me/faq
curl.exe -I https://examsphere.me/contacto
curl.exe -I https://examsphere.me/aviso-legal
curl.exe -I https://examsphere.me/privacidad
curl.exe -I https://examsphere.me/cookies
```

Todas deben devolver `200`.

```powershell
curl.exe -I https://examsphere.me/404
curl.exe -I https://examsphere.me/esta-ruta-no-existe
```

Esperado:
- `/404` no indexable
- ruta inexistente con comportamiento de error real (evitar soft-404 indexable)

```powershell
curl.exe -I https://examsphere.me/api/stats
```

Esperado:
- cabecera `X-Robots-Tag: noindex, nofollow`

## 3) Verificaciones SEO de archivos publicos

```powershell
curl.exe https://examsphere.me/robots.txt
curl.exe https://examsphere.me/sitemap.xml
curl.exe https://examsphere.me/sitemap-pages.xml
curl.exe https://examsphere.me/ads.txt
```

Esperado:
- `robots.txt` con:
  - `Disallow: /api/`
  - `Disallow: /404`
  - `Disallow: /estadisticas`
- `sitemap-pages.xml` sin URLs no indexables
- `ads.txt` accesible con 200

## 4) Estado actual del repositorio (predeploy)

Ya implementado en codigo:
- control `noindex` por pagina en `SEO`
- `noindex` en `NotFound` y `Estadisticas`
- `robots.txt` endurecido
- API con `X-Robots-Tag`
- `404.html` estatico dedicado con `noindex`
- rutas estaticas SEO generadas por postbuild (incluye `/estadisticas`)
- `canonical` y `og:url` especificos por ruta en HTML estatico generado

## 4.1) Coherencia router vs sitemap (validado local)

Resultado local:
- rutas publicas en router: 18
- rutas en sitemap: 17
- diferencia: solo `/estadisticas`

Interpretacion:
- diferencia correcta e intencional, porque `/estadisticas` esta marcada como `noindex` y bloqueada en `robots.txt`.

## 5) Criterio Go/No-Go para solicitar AdSense

Go:
- todas las URLs indexables en `200`
- sin soft-404 en rutas relevantes
- rutas tecnicas no indexables
- sitemap limpio y consistente
- legales visibles y navegacion correcta

No-Go:
- rutas del sitemap devolviendo 404 o redireccionando mal
- rutas inexistentes tratadas como contenido util indexable
- API indexable sin cabeceras de bloqueo
