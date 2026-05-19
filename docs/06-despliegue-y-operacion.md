# 06 - Despliegue y Operacion

## 1. Componentes desplegables

Hay varias piezas con ciclo de despliegue distinto:

1. Frontend SPA:
   - fuente: `client/`
   - salida: `dist/public`
   - servido por hosting web (actualmente combinado con flujo GitHub Pages + capa Cloudflare)

2. Worker principal:
   - fuente: `worker/src/index.ts`
   - desplegado con Wrangler
   - URL worker: `https://examgen-worker.examsphere.workers.dev`

3. Worker de prerender:
   - fuente: `prerender-worker/src/index.ts`
   - enruta bots y fallback de rutas publicas

## 2. Scripts y comandos utiles

Desde raiz:
- `npm run dev` -> frontend dev
- `npm run build` -> build frontend + server bundle
- `npm run check` -> typecheck TS

Worker (`worker/`):
- `npm run dev` -> `wrangler dev`
- `npm run deploy` -> `wrangler deploy`

Prerender worker:
- despliegue via Wrangler segun `prerender-worker/wrangler.toml`

## 3. Variables y secrets

Frontend:
- `VITE_WORKER_URL` -> URL base de API worker.

Worker:
- `OPENROUTER_API_KEY`
- `OPENROUTER_API_KEY_BACKUP_1`
- `OPENROUTER_API_KEY_BACKUP_2`
- `OPENROUTER_API_KEY_BACKUP_3`
- binding KV `STATS_KV`

Prerender:
- `PRERENDER_TOKEN` (secret)
- `PRERENDER_HOSTS` (var)
- `PRERENDER_SERVICE_URL` (var)

## 4. DNS / Cloudflare operativo

Para usar worker frontal y proxy:
- Zona del dominio debe estar activa en Cloudflare.
- Nameservers del registrador deben apuntar a Cloudflare.
- Registros web en modo Proxied cuando aplique.

## 5. Checklist de release recomendado

Antes de publicar:
1. `npm run check` en raiz.
2. Si se toca worker: validar deploy dry-run y luego deploy.
3. Si se toca frontend:
   - validar en local rutas clave:
     - `/`
     - `/como-usar`
     - `/faq`
     - `/blog`
     - `/sobre-nosotros`
4. Verificar endpoint stats:
   - `/api/stats` responde correcto.
5. Verificar generacion examen:
   - caso corto
   - caso medio
   - caso largo

Despues de publicar:
1. Smoke test rapido en web real.
2. Revisar logs de worker si hay degradacion.
3. Revisar que `/ads.txt`, sitemap y rutas publicas siguen accesibles.

## 6. Incidencias comunes de operacion

### 6.1 Frontend actualizado pero worker viejo

Sintoma:
- Mensajes de error incoherentes o contrato roto.

Accion:
- redeploy de `worker/` con `wrangler deploy`.

### 6.2 Rate limit o latencia alta

Causas tipicas:
- modelos `:free` saturados
- alta concurrencia
- demasiados chunks + reintentos

Mitigacion:
- revisar configuracion de chunks/concurrencia
- fallback de modelos/keys
- medir comportamiento por tipo de documento

### 6.3 Rutas publicas devuelven 404 para bots

Accion:
- revisar worker de prerender/fallback activo en rutas del dominio.

