# 08 - Testing, Debugging y Riesgos

## 1. Testing disponible hoy

Checks de base:
- `npm run check` (typecheck TS en raiz).

Worker:
- test puntual en `worker/index.test.mjs` (segun estado de rama).

Validacion funcional recomendada:
1. Generacion:
   - pedir 10 preguntas
   - pedir 20 preguntas
   - probar documento largo (>= 1 bloque grande)
2. Tutor:
   - consulta normal
   - timeout client-side
   - limite de uso modo prueba
3. Estadisticas:
   - track visit
   - track event
   - feedback encuesta y tutor

## 2. Debugging por capas

### 2.1 Frontend

Archivos clave:
- `client/src/lib/geminiService.ts`
- `client/src/pages/Home.tsx`

Puntos de observacion:
- parseo SSE
- mapeo de errores a `ExamGenerationError`
- estado `loading` y estados de tutor

### 2.2 Worker

Archivo:
- `worker/src/index.ts`

Puntos de observacion:
- fallback de modelos
- failover de API keys
- saneado de preguntas
- refuerzo de faltantes
- clasificacion de errores (`WorkerAppError`)

### 2.3 Infra

Verificar:
- worker desplegado en version esperada
- secrets configurados
- bindings KV activos
- rutas de prerender correctamente asociadas

## 3. Problemas recurrentes y lectura rapida

### Caso A: "Pido N preguntas y salen menos"

Causas probables:
1. bloque/s con output invalido descartado por saneado
2. deficit no recuperado tras refuerzos
3. saturacion upstream

Acciones:
- revisar logs SSE
- confirmar cantidad final tras cada refuerzo
- verificar estado de modelos free y limites

### Caso B: "Tutor no devuelve respuesta util"

Causas probables:
1. worker de produccion desalineado respecto frontend
2. payload invalido
3. respuesta upstream sin `answer` util

Acciones:
- redeploy worker
- probar endpoint `/api/tutor-error` aislado
- verificar timeout y mensaje de error en frontend

### Caso C: "Lentitud alta"

Causas probables:
- combinacion de chunks + reintentos + saturacion modelos free.

Acciones:
- revisar chunking y concurrencia
- monitorizar cuantas iteraciones de refuerzo se ejecutan
- medir tiempo total y tasa de exito

## 4. Riesgos tecnicos actuales

1. Dependencia de modelos `:free`:
   - latencia y disponibilidad variables.

2. No hay identidad autenticada:
   - limites por navegador son faciles de eludir.

3. KV como contador agregado:
   - no hay trazabilidad de evento individual detallado.

4. Encoding heredado:
   - hay zonas con mojibake historico en algunos archivos.
   - conviene plan de saneado codificacion cuando no haya urgencias de producto.

## 5. Recomendaciones de robustez (proximo nivel)

1. Control de limites de tutor en backend (no solo localStorage).
2. Telemetria de calidad por chunk:
   - cuantas preguntas pedidas vs validas por chunk.
3. Circuit breaker por proveedor/modelo para evitar colas largas.
4. Pipeline de pruebas automatizadas para:
   - contrato de endpoints
   - parseo SSE
   - validacion de esquema de preguntas.

