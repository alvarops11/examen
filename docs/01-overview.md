# 01 - Overview del Proyecto

## 1. Que es ExamSphere

ExamSphere es una plataforma web para crear simulacros tipo test a partir de contenido de estudio (texto pegado o contenido extraido de PDF), corregirlos y ofrecer explicaciones pregunta a pregunta.

El producto combina:
- Interfaz frontend para crear, responder y corregir examenes.
- Backend serverless en Cloudflare Worker para orquestar generacion con modelos de OpenRouter.
- Capa de analitica con Cloudflare KV para estadisticas de uso.

## 2. Propuesta de valor del producto

El flujo de valor principal es:
1. El usuario aporta material real de estudio.
2. El sistema genera preguntas estructuradas.
3. El usuario realiza el simulacro en interfaz de examen.
4. El sistema corrige y explica.
5. El usuario puede resolver dudas con "Tutor de errores" (modo prueba limitado).

Diferenciadores funcionales del estado actual:
- Generacion con validacion estructural de preguntas.
- Soporte de documentos largos con chunking y seleccion de bloques.
- Reintentos y fallback de modelos/keys para mejorar disponibilidad.
- Estadisticas de producto y feedback integrado (encuesta + tutor).

## 3. Estado actual de arquitectura

Arquitectura principal:
- `client/`: app React + TypeScript (SPA) con rutas publicas.
- `worker/`: API de generacion y analitica (Cloudflare Worker).
- `server/`: servidor Express para servir build estatico en ciertos entornos.
- `prerender-worker/`: worker frontal para SEO/prerender/fallback de rutas publicas.

## 4. Estructura de repositorio (resumen)

```text
examen/
  client/                    # Frontend React (SPA)
  worker/                    # Cloudflare Worker principal (API + metrica)
  prerender-worker/          # Worker frontal para bots/IA y fallback SPA
  server/                    # Express para servir build estatico
  shared/                    # Constantes compartidas
  Video/                     # Piezas visuales/promocionales
  .github/                   # Workflows CI/CD
  README.md                  # README historico del proyecto
  TECHNICAL_SUMMARY.md       # Resumen tecnico historico
  DEPLOYMENT.md              # Notas de despliegue
```

## 5. Stack tecnologico principal

App web:
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI (componentes base)
- Framer Motion
- Sonner (toasts)
- Wouter (routing)

Backend:
- Cloudflare Workers
- OpenRouter Chat Completions API
- Cloudflare KV (`STATS_KV`)
- Wrangler

Documentos / export:
- `pdfjs-dist` para lectura PDF
- `jspdf` + `jspdf-autotable` para exportacion PDF

## 6. Objetivos tecnicos operativos

1. Robustez en generacion de examenes:
   - Manejar errores upstream y contenido irregular.
   - Intentar completar numero de preguntas solicitado.

2. UX de simulacro:
   - Flujo continuo generar -> resolver -> corregir -> aprender.
   - Modo temporizador/cronometro.

3. Observabilidad de producto:
   - Medir visitas, generacion, feedback y uso tutor.
   - Exponer panel `/estadisticas`.

4. SEO y rastreabilidad:
   - Rutas publicas consistentes.
   - Sitemap y prerender para bots/IA.

