# 04 - Worker API (Cloudflare)

## 1. Ubicacion y runtime

Directorio: `worker/`
Archivo principal: `worker/src/index.ts`
Infra:
- Cloudflare Workers
- KV binding: `STATS_KV`

Secrets esperados:
- `OPENROUTER_API_KEY`
- `OPENROUTER_API_KEY_BACKUP_1` (opcional)
- `OPENROUTER_API_KEY_BACKUP_2` (opcional)
- `OPENROUTER_API_KEY_BACKUP_3` (opcional)

## 2. Endpoints expuestos

### 2.1 `GET /api/stats`

Devuelve agregados para panel de estadisticas:
- visitas (hoy/mes/total)
- examenes (hoy/mes/total)
- examenes por tipo (`multiple_choice`, `true_false`) en hoy/mes/total
- segmentacion new/returning
- dificultades
- cursos
- metricas tecnicas (preguntas totales / tiempo total)
- eventos PDF y rating
- metrica de tutor (opens, mensajes, limite, feedback)

### 2.2 `POST /api/track-visit`

Input esperado:
- `visitorType?: "new" | "returning"`

Accion:
- Incrementa visita diaria.
- Segmenta visitas nuevas/recurrentes.

### 2.3 `POST /api/track-event`

Input esperado:
- `event: string`
- `visitorType?: "new" | "returning"`
- `visitorId?: string`
- `rating?: number`
- `liked?: boolean`

Accion:
- Incrementa contador de evento.
- Segmenta por tipo de visitante cuando aplica.
- Mantiene contadores unicos del tutor por `visitorId`.
- Calcula agregados de rating (count/sum/avg).

### 2.4 `POST /api/tutor-error`

Input esperado:
- `question` (estructura de pregunta de examen)
- `userMessage` (duda del alumno)
- `userAnswerIndex` (opcional)
- metadatos de visitante (opcionales)

Output:
- `200`: `{ "answer": string }`
- `500`: objeto de error tipificado.

Flujo:
1. Validacion minima de payload.
2. Prompt contextual al tutor.
3. Consulta OpenRouter.
4. Sanitizacion de salida.

Modelo actual del tutor:
- `openrouter/free` (unico modelo configurado para tutor en la version actual).

### 2.5 `POST /api/generate`

Input esperado (`GenerateRequest`):
- `curso: string`
- `dificultad: string`
- `numeroPreguntas: number`
- `numeroRespuestas: number`
- `temario: string`
- `visitorType?`
- `visitorId?`

Output:
- Stream SSE con eventos:
  - `{ type: "log", message }`
  - `{ type: "error", code, message, userMessage, retryable }`
  - `{ type: "result", data: ExamResponse }`

## 3. Pipeline de generacion de examen

### 3.1 Validaciones iniciales

- `temario` no vacio.
- longitud minima de `temario` (umbral actual 120 chars utiles).
- clave API principal presente.

### 3.2 Chunking y seleccion de bloques

Funciones:
- `splitText(...)`: troceo en chunks conservando contexto.
- `selectRepresentativeChunks(...)`: muestreo uniforme.
- `selectCompactChunks(...)`: modo compacto para documentos grandes.

Regla de modo compacto:
- si `allChunks.length >= 18`, usa seleccion compacta.

### 3.3 Distribucion de cuota de preguntas

`distributeQuestionCounts(totalQuestions, totalChunks)`:
- reparte cuota por chunk con base + remainder.

### 3.4 Generacion por chunk

Por cada chunk:
1. Construye prompt estricto (formato JSON, idioma, homogeneidad de opciones).
2. Prueba modelos de examen en secuencia:
   - `google/gemma-3-12b-it:free`
   - `qwen/qwen3.6-plus:free`
   - `openrouter/free`
3. Cada llamada usa `fetchWithFailover(...)` para rotar API keys y reintentar.
4. Parsea JSON y pasa por `sanitizeQuestions(...)`.

### 3.5 Validacion / saneado

`sanitizeQuestion(...)` exige:
- `question` no vacio
- `explanation` no vacia
- `choices.length === numeroRespuestas`
- `answerIndex` valido

Luego:
- mezcla orden de opciones
- recalcula `answerIndex` segun la opcion correcta original

### 3.6 Refuerzo de faltantes

Si faltan preguntas tras la primera pasada:
- entra en refuerzo con hasta 3 iteraciones.
- recalcula deficit en cada iteracion.
- vuelve a generar sobre chunks representativos.
- corta si una iteracion no añade preguntas nuevas.

### 3.7 Respuesta final

- Si `allQuestions.length > numeroPreguntas`, recorta.
- Si `allQuestions.length === 0`, emite error SSE tipificado.
- Si hay preguntas, emite `result` con IDs reindexados.

## 4. Manejo de errores y codigos

`ErrorCode` relevante:
- `RATE_LIMIT`
- `EMPTY_CONTENT`
- `CONTENT_TOO_SHORT`
- `DOCUMENT_PROCESSING_FAILED`
- `UPSTREAM_UNAVAILABLE`
- `SERVER_MISCONFIG`
- `NO_QUESTIONS_GENERATED`
- `UNKNOWN`

Todas las respuestas de error se normalizan con:
- `code`
- `message` (tecnico)
- `userMessage` (UX)
- `retryable` (bool)

## 5. Notas de rendimiento y limites

Factores de latencia:
- numero de chunks seleccionados
- concurrencia por chunks
- calidad del proveedor/modelo free
- reintentos por modelo y por API key

Factores de consistencia:
- calidad de parseo JSON del modelo
- estricta validacion de `choices`/`answerIndex`
- capacidad real de completar deficit en refuerzos
