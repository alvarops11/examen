# 03 - Frontend (client)

## 1. Stack y build

Directorio: `client/`

Tecnologias principales:
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Wouter para routing
- Framer Motion para animacion
- Sonner para notificaciones

Build root del monorepo:
- Script principal en `package.json` raiz:
  - `vite build`
  - copia de `index.html` a `404.html` para fallback de hosting estatico

## 2. Entry points

Archivos clave:
- `client/src/main.tsx`: bootstrap React.
- `client/src/App.tsx`: router principal de la SPA.
- `client/src/index.css`: estilos globales y tokens visuales.

## 3. Rutas funcionales

Rutas principales de producto:
- `/` -> `Home` (generador y simulacro).
- `/estadisticas` -> panel interno de metricas.

Rutas de contenido/SEO:
- `/como-usar`
- `/faq`
- `/contacto`
- `/sobre-nosotros`
- `/blog` y posts de blog
- `/aviso-legal`
- `/privacidad`
- `/cookies`

Fallback:
- `/404`
- `NotFound` final.

## 4. Home como nucleo del producto

Archivo clave: `client/src/pages/Home.tsx`.

Capacidades:
1. Entrada de contenido (texto o PDF extraido).
2. Configuracion de examen:
   - curso
   - dificultad
   - numero de preguntas
   - numero de respuestas por pregunta
3. Generacion via SSE.
4. Resolucion de preguntas.
5. Correccion con explicaciones.
6. Exportes PDF.
7. Timer/cronometro.
8. Encuesta de calidad del examen.
9. Tutor de errores por pregunta corregida.

## 5. Servicio de integracion API

Archivo: `client/src/lib/geminiService.ts`.

Responsabilidades:
- Resolver base URL (`VITE_WORKER_URL` o localhost).
- `generateExamWithOpenRouter(...)`:
  - consume stream SSE
  - parsea eventos `log`, `error`, `result`
- `trackVisit()`
- `trackEvent()`
- `fetchStats()`
- `askErrorTutor(...)` con timeout client-side.

## 6. Estado local importante

Persistencia `localStorage`:
- Visitante:
  - `visitor_id`
  - first seen
  - last seen
  - visit count
  - active days
- Tutor (modo prueba):
  - contador de consultas
  - estado de feedback enviado

Implicacion:
- Ciertos limites/flags son por navegador, no por cuenta autenticada.

## 7. UX de errores y carga

Patrones:
- Toasts para errores de red y backend.
- Mensajes de progreso durante SSE.
- Captura de `retryable` para guiar reintento.

Limitacion conocida:
- Si backend tarda mucho o upstream esta saturado, la UX depende del timeout y de la cadencia de respuesta SSE.

## 8. Componentizacion

Carpetas:
- `client/src/components/`: bloques app-level.
- `client/src/components/ui/`: primitives y componentes base.

Nota:
- `components/ui/` es amplio y sirve de toolkit, no toda esa carpeta implica complejidad funcional de negocio.

## 9. SEO y assets publicos

En `client/public/`:
- `robots.txt`
- `sitemap.xml`
- `sitemap-pages.xml`
- `ads.txt`
- imagenes OG y blog covers

Relacion con SEO:
- Las rutas publicas estan pensadas para indexacion.
- El prerender worker se usa para mejorar rastreo de bots/IA.

## 10. Banners de actualizacion (Home)

Componente:
- `client/src/components/UpdateBanner.tsx`

Estado actual:
- Banner superior de anuncio general desactivado/eliminado.
- Se mantiene solo la tarjeta inferior derecha de actualizacion.
- Mensaje actual orientado a la funcionalidad de tipo de examen:
  - `Tipo Test`
  - `Verdadero/Falso`
- Persistencia por navegador via `localStorage` con clave versionada:
  - `updateBannerDismissed:2026-05-exam-type-vf`

Ajuste UX reciente (desktop):
- El selector `Tipo Examen` usa componente `Select` con visualización compacta:
  - opción en lista: `Verdadero o Falso`
  - valor mostrado al seleccionar: `V/F`
- Se eliminó icono decorativo adicional del control para evitar desalineación visual.
- Se restauró la malla superior a `lg:grid-cols-5` para mantener proporciones equilibradas.

Comportamiento al corregir examen:
- Al corregir (aprobado o suspenso), se aplica una animación corta de desplazamiento al inicio de la vista del examen.
- Si se aprueba (>= 50%), además se muestra la celebración visual.
