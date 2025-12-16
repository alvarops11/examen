# Guía de Despliegue - ExamGen

Esta guía te ayudará a desplegar ExamGen en GitHub Pages (frontend) y Cloudflare Workers (backend).

## Requisitos Previos

- **Node.js 18+**
- **Git**
- **Cuenta de GitHub**
- **Cuenta de Cloudflare**
- **API Key de OpenRouter** (Obtén una en [openrouter.ai](https://openrouter.ai/))

## Paso 1: Obtener la API Key de OpenRouter

1. Ve a [OpenRouter](https://openrouter.ai/)
2. Crea una cuenta y genera una API Key.
3. **Guarda esta clave en un lugar seguro.**

## Paso 2: Desplegar el Cloudflare Worker (Backend)

El backend es necesario para ocultar tu API Key y procesar las peticiones de IA.

### 2.1 Instalar Wrangler y Autenticar
```bash
npm install -g wrangler
wrangler login
```

### 2.2 Configurar la API Key Segura
```bash
cd worker
wrangler secret put OPENROUTER_API_KEY
```
*Pega tu API Key de OpenRouter cuando te lo pida.*

### 2.3 Desplegar
```bash
npm run deploy
```

Cloudflare te dará una URL (ej: `https://examgen-worker.TU_USUARIO.workers.dev`). **CÓPIALA.**

## Paso 3: Configurar el Frontend

El frontend necesita saber dónde está tu backend.

1. Crea un archivo `.env.production` en la carpeta raíz del proyecto (junto a `.env.example`).
2. Añade esta línea con tu URL del paso anterior:
   ```
   VITE_WORKER_URL=https://examgen-worker.TU_USUARIO.workers.dev
   ```

## Paso 4: Desplegar en GitHub Pages (Frontend)

### 4.1 Construir el proyecto
```bash
# Vuelve a la raíz
cd .. 
npm run build
```
Esto creará una carpeta `dist/` optimizada para producción.

### 4.2 Subir a GitHub
1. Crea un repo en GitHub.
2. Sube tus archivos (asegúrate de que la carpeta `dist` esté incluida o configurada en tu .gitignore dependiendo de tu estrategia, para principiantes sugerimos subir el código fuente y usar GitHub Actions, pero si sigues el método manual asegúrate de subir el contenido de dist a una rama `gh-pages`).

**Método Recomendado (GitHub Actions):**
El proyecto ya está configurado para usarse con Vite. Solo necesitas hacer push de tu código fuente (`src`, `package.json`, etc) a GitHub.
Luego en GitHub: Settings > Pages > Source: GitHub Actions.

Si prefieres el método manual de subir la carpeta `dist`:
```bash
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```


### 5.2 Reconstruir y desplegar

```bash
# Vuelve a la carpeta raíz
cd ..

# Reconstruye el frontend
npm run build

# Haz push de los cambios
git add .
git commit -m "Update worker URL"
git push origin main
```

## Paso 6: Probar la Aplicación

1. Ve a `https://TU_USUARIO.github.io/examgen`
2. Completa el formulario:
   - Selecciona un curso
   - Selecciona una asignatura
   - Selecciona la dificultad
   - Pega un temario o carga un archivo .txt
3. Haz clic en "Generar Examen"
4. Responde las preguntas
5. Haz clic en "Corregir Examen"

## Solución de Problemas

### El examen no se genera

**Error en la consola:** "CORS error" o "Failed to fetch"

**Solución:**
1. Verifica que la URL del Worker sea correcta en `Home.tsx`
2. Asegúrate de que el Worker esté desplegado: `wrangler deploy`
3. Abre la consola del navegador (F12) para ver el error exacto

### Error: "GEMINI_API_KEY not found"

**Solución:**
1. Verifica que la variable esté configurada:
   ```bash
   cd worker
   wrangler secret list
   ```
2. Si no aparece, configúrala de nuevo:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
3. Redeploya el Worker:
   ```bash
   npm run deploy
   ```

### El temario no se carga desde archivo

**Solución:**
1. Asegúrate de que el archivo sea .txt
2. Intenta pegar el contenido directamente en el textarea

### GitHub Pages no actualiza los cambios

**Solución:**
1. Limpia el caché del navegador (Ctrl+Shift+Delete)
2. Espera 5 minutos para que GitHub Pages reconstruya
3. Verifica que el build fue exitoso en "Actions" en GitHub

## Actualizar la Aplicación

Si necesitas hacer cambios:

### Frontend

```bash
# Edita los archivos en client/
# Luego:
npm run build
git add .
git commit -m "Descripción del cambio"
git push origin main
```

### Backend (Worker)

```bash
# Edita los archivos en worker/src/
# Luego:
cd worker
npm run deploy
```

## Seguridad

- **Nunca compartas tu API key de Gemini**
- **Usa variables de entorno** para configuraciones sensibles
- **Revisa regularmente** los logs de Cloudflare para detectar abusos

## Soporte

Si encuentras problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs del Worker: `wrangler tail`
3. Consulta la documentación de [Cloudflare Workers](https://developers.cloudflare.com/workers/)
4. Consulta la documentación de [Google Gemini API](https://ai.google.dev/)

## Próximos Pasos

- Personaliza el formulario con más asignaturas
- Añade más opciones de dificultad
- Implementa estadísticas de desempeño
- Añade soporte para diferentes tipos de preguntas
