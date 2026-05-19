# 05 - Datos y Metricas

## 1. Principio de almacenamiento

No hay base de datos relacional en la arquitectura actual.

Persistencia productiva usada para analitica:
- Cloudflare KV namespace `STATS_KV`.

Persistencia local de navegador:
- `localStorage` para identidad anonima de visitante y limites UX del tutor.

## 2. Claves KV principales

### 2.1 Visitas

Patrones:
- `v:<YYYY-MM-DD>` -> visitas del dia
- `v:<YYYY-MM>` -> visitas del mes
- `v:all` -> visitas totales

Segmentacion visitas:
- `vn:new:<YYYY-MM-DD>`
- `vn:returning:<YYYY-MM-DD>`
- `vn:new:<YYYY-MM>`
- `vn:returning:<YYYY-MM>`
- `vn:new:all`
- `vn:returning:all`

### 2.2 Examenes generados

Patrones:
- `e:<YYYY-MM-DD>`
- `e:<YYYY-MM>`
- `e:all`

Segmentacion examenes:
- `es:new:<YYYY-MM-DD>`
- `es:returning:<YYYY-MM-DD>`
- `es:new:<YYYY-MM>`
- `es:returning:<YYYY-MM>`
- `es:new:all`
- `es:returning:all`

### 2.3 Dificultad y curso

Dificultad:
- `diff:facil`
- `diff:media`
- `diff:dificil`

Curso:
- `course:1º`
- `course:2º`
- `course:3º`
- `course:4º`
- `course:Máster`

### 2.4 Metrica tecnica agregada

- `stats:total_questions`
- `stats:total_gen_time`

Nota:
- `total_gen_time` se acumula en milisegundos.

### 2.5 Eventos de producto

Patron general:
- `event:<eventName>`
- `event:<eventName>:new`
- `event:<eventName>:returning`

Eventos actualmente relevantes:
- `event:pdf_normal`
- `event:pdf_corrected`
- `event:exam_rating`
- `event:error_tutor_opened`
- `event:error_tutor_message_sent`
- `event:error_tutor_limit_reached`
- `event:error_tutor_trial_feedback_yes`
- `event:error_tutor_trial_feedback_no`

### 2.6 Rating de examen

- `rating:count`
- `rating:sum`
- `rating:avg`
- `rating:value:1`
- `rating:value:2`
- `rating:value:3`
- `rating:value:4`
- `rating:value:5`

### 2.7 Unicos de tutor

- `unique:error_tutor_users`
- `unique:error_tutor_message_users`
- `unique:error_tutor_users:<visitorId>`
- `unique:error_tutor_message_users:<visitorId>`

## 3. Datos locales en frontend

### 3.1 Identidad anonima visitante

Claves:
- `visitor_id`
- `visitor_first_seen_at`
- `visitor_last_seen_at`
- `visitor_visit_count`
- `visitor_active_days`
- `last_visit`

Uso:
- distinguir `new` vs `returning`
- evitar doble conteo de visita diaria
- enriquecer payloads de tracking

### 3.2 Tutor modo prueba

Claves:
- `error_tutor_usage_count`
- `error_tutor_feedback_sent`

Implicacion:
- limite UX por navegador/dispositivo
- no es un control antifraude robusto de backend.

## 4. Lectura de metricas en UI

Ruta:
- `/estadisticas`

Fuente:
- `GET /api/stats`

Bloques de visualizacion:
- visitas
- examenes
- conversion/segmentacion new-returning
- dificultades y cursos
- eventos PDF
- rating agregado
- uso tutor y feedback tutor

## 5. Limitaciones analiticas actuales

1. Modelo de identidad anonima por navegador:
   - no une dispositivos.
   - borrado de storage reinicia identidad.

2. KV agrega contadores:
   - no guarda eventos raw detallados.
   - analisis historico fino limitado.

3. Sin sistema de usuarios autenticados:
   - no hay cohortes de usuario persistente cross-device.

