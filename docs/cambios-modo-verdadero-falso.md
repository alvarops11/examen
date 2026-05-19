# Cambios: modo Verdadero/Falso (fase 2)

Fecha: 2026-05-19

## Objetivo

Completar la integración del nuevo tipo de examen `Verdadero o Falso` en el worker sin romper el flujo existente de tipo test.

## Archivos tocados

- `worker/src/index.ts`

## Cambios realizados

1. **Cableado de `examType` en el endpoint de generación**
   - Se normaliza `examType` desde el request (`multiple_choice` por defecto).
   - Se calcula `expectedChoices` dinámico:
     - `2` para `true_false`
     - `numeroRespuestas || 4` para `multiple_choice`

2. **Prompt dinámico por tipo de examen**
   - Se mantiene el prompt general para `multiple_choice`.
   - Se añade prompt específico para `true_false` con reglas de salida estrictas:
     - exactamente 2 opciones
     - opciones canónicas: `Verdadero` y `Falso`
     - mismas reglas de autosuficiencia y calidad

3. **Validación/saneado/ranking conectados al tipo**
   - `sanitizeQuestions(...)` ahora usa `expectedChoices` + `examType`.
   - `getHardRejectionReason(...)` ahora usa `expectedChoices` + `examType`.
   - `computeQuestionScore(...)` ahora usa `examType`.

4. **Orden visual estable en V/F**
   - En `true_false`, las opciones se muestran siempre en este orden:
     - `Verdadero`
     - `Falso`
   - Se mantiene el `answerIndex` correcto tras reordenar para evitar confusión al alumno.

5. **Refuerzo de dificultad en prompts (MCQ y V/F)**
   - Se añadieron reglas para aumentar exigencia sin salirse del fragmento:
     - matices, condiciones y excepciones
     - distractores plausibles y cercanos a la correcta
   - mini-casos prácticos cuando el contenido lo permita

6. **Refuerzo adicional de prompt (sin tocar pipeline)**
   - Reglas explícitas anti-redundancia semántica entre preguntas.
   - Regla de densidad conceptual mínima (condición, comparación, implicación, excepción, causalidad, moderador o aplicación).
   - Regla de reformulación activa para reducir memoria literal.
   - Bloque de autocontrol final del modelo antes de devolver JSON:
     - eliminar triviales, redundantes, ambiguas, literales o estructurales.

7. **Refuerzo de pipeline de calidad (fase actual)**
   - Filtro duro de estructura documental en preguntas:
     - rechazo de preguntas sobre capítulo/sección/apartado/índice/numeración interna (`3.4`, `5.2.2`, etc.).
   - Selección final con diversidad semántica:
     - límite de 2 preguntas por familia conceptual similar.
     - descarte contabilizado en métrica `semantic_family_cap`.
   - Se mantiene fallback de relleno para no perder cobertura total cuando el cap sea muy restrictivo.

## Decisiones técnicas

- Se evita crear una ruta nueva: el endpoint actual `/api/generate` sigue siendo único y compatible.
- Se reutiliza el pipeline existente de chunks, refuerzo y scoring para minimizar riesgo.
- El modo `true_false` se restringe de forma dura para garantizar consistencia de datos en frontend y corrección.

## Riesgos / limitaciones

- Si un modelo devuelve variantes no canónicas (`Sí/No`, `True/False`), se intentan normalizar en saneado; si no es posible, se descartan.
- En temarios de baja calidad, el modo `true_false` puede generar menos preguntas válidas por la restricción fuerte.

## Cómo probar

1. En frontend, seleccionar:
   - `Tipo Examen: Verdadero o Falso`
2. Generar examen.
3. Verificar:
   - cada pregunta tiene solo 2 opciones
   - opciones mostradas: `Verdadero` y `Falso`
   - corrección y explicaciones funcionan igual que en tipo test
4. Repetir en `Tipo Test` para comprobar que no hay regresión.
