# 02 - Arquitectura del Sistema

## 1. Vista general

Arquitectura por capas:

1. Capa de presentacion:
   - SPA en `client/` (React + TS).
   - Rutas publicas de contenido y ruta principal de simulacro.

2. Capa de API:
   - Cloudflare Worker en `worker/src/index.ts`.
   - Endpoints de generacion, tracking, stats y tutor.

3. Capa de datos analiticos:
   - Cloudflare KV namespace `STATS_KV`.
   - Contadores agregados y claves por dia/mes/total.

4. Capa SEO/front proxy:
   - `prerender-worker/` para bots y fallback de rutas publicas.

## 2. Flujos funcionales principales

### 2.1 Generacion de examen (SSE)

1. Frontend llama `POST /api/generate`.
2. Worker valida request y contenido minimo.
3. Worker trocea `temario` en chunks.
4. Worker selecciona bloques representativos o modo compacto.
5. Worker genera preguntas por chunk usando OpenRouter.
6. Worker sanea/valida preguntas (`sanitizeQuestions`).
7. Worker refuerza preguntas faltantes con hasta 3 pasadas.
8. Worker emite logs SSE (`type: "log"`).
9. Worker emite resultado SSE (`type: "result"`).
10. Frontend parsea stream y actualiza estado.

### 2.2 Tutor de errores

1. Frontend abre modal por pregunta corregida.
2. Frontend llama `POST /api/tutor-error`.
3. Worker construye prompt contextual con:
   - enunciado
   - opciones
   - respuesta correcta
   - respuesta del alumno (si existe)
   - explicacion base
4. Worker consulta OpenRouter con fallback de API keys.
5. Worker devuelve `{ answer }`.
6. Frontend renderiza respuesta en thread local de esa pregunta.

### 2.3 Tracking y estadisticas

1. Frontend registra visita diaria (`/api/track-visit`).
2. Frontend registra eventos (`/api/track-event`).
3. Worker incrementa contadores en `STATS_KV`.
4. Frontend consume `GET /api/stats` para `/estadisticas`.

## 3. Separacion de responsabilidades

Frontend (`client/`):
- UX y estado de simulacro.
- Extraccion de texto de PDF.
- Presentacion de errores/feedback.
- Persistencia ligera en `localStorage` para ciertas funciones UX.

Worker (`worker/`):
- Generacion y validacion de examenes.
- Manejo de fallos upstream y failover de keys.
- API de tutor.
- Estadisticas y analitica.

Prerender worker (`prerender-worker/`):
- Intercepcion de requests de bots.
- Respuesta prerenderizada.
- Fallback de rutas SPA con status HTTP correcto.

## 4. Consideraciones de resiliencia

Ya implementado:
- Failover entre multiples API keys.
- Fallback entre modelos en generacion principal.
- Validacion de estructura de preguntas.
- Refuerzo de preguntas faltantes hasta 3 iteraciones.
- Timeout de tutor en frontend (abort client-side).

Riesgos todavia presentes:
- Dependencia fuerte de modelos `:free` en latencia/429.
- Calidad variable por naturaleza del upstream LLM.
- Cuotas/limites de subrequests y rate limits segun carga.

## 5. Contrato de errores

Backend tipifica errores con:
- `code`
- `message` (tecnico)
- `userMessage` (orientado a UX)
- `retryable`

Frontend transforma esto en excepciones `ExamGenerationError` y toasts.

