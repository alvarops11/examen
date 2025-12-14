# Guía de Despliegue - ExamGen

Esta guía te ayudará a desplegar ExamGen en GitHub Pages (frontend) y Cloudflare Workers (backend).

## Requisitos Previos

- **Node.js 18+** - Descarga desde [nodejs.org](https://nodejs.org/)
- **Git** - Descarga desde [git-scm.com](https://git-scm.com/)
- **Cuenta de GitHub** - Crea una en [github.com](https://github.com/)
- **Cuenta de Cloudflare** - Crea una en [cloudflare.com](https://www.cloudflare.com/)
- **API Key de Gemini** - Obtén una en [Google AI Studio](https://aistudio.google.com/app/apikeys)

## Paso 1: Obtener la API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Haz clic en "Create API key"
3. Selecciona "Create API key in new project"
4. Copia la clave generada (la necesitarás después)
5. **Guarda esta clave en un lugar seguro**

## Paso 2: Preparar el Repositorio en GitHub

### 2.1 Crear un nuevo repositorio

1. Ve a [GitHub](https://github.com/new)
2. Nombre del repositorio: `examgen`
3. Descripción: "Generador de exámenes con Gemini"
4. Selecciona "Public"
5. Haz clic en "Create repository"

### 2.2 Clonar el repositorio localmente

```bash
git clone https://github.com/TU_USUARIO/examgen.git
cd examgen
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

### 2.3 Copiar los archivos del proyecto

Copia todos los archivos del proyecto ExamGen al repositorio clonado:

```bash
# Desde la carpeta del proyecto original
cp -r client/* /ruta/a/tu/repositorio/
cp -r worker /ruta/a/tu/repositorio/
cp README.md /ruta/a/tu/repositorio/
cp DEPLOYMENT.md /ruta/a/tu/repositorio/
```

## Paso 3: Desplegar el Frontend en GitHub Pages

### 3.1 Instalar dependencias

```bash
cd examgen
npm install
# o si usas pnpm
pnpm install
```

### 3.2 Construir el proyecto

```bash
npm run build
```

Esto creará una carpeta `dist/` con los archivos estáticos.

### 3.3 Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Haz clic en "Settings"
3. En el menú izquierdo, selecciona "Pages"
4. En "Source", selecciona "Deploy from a branch"
5. Selecciona rama `main` y carpeta `/dist`
6. Haz clic en "Save"

### 3.4 Hacer push del código

```bash
git add .
git commit -m "Initial commit: ExamGen frontend"
git push origin main
```

**Tu frontend estará disponible en:** `https://TU_USUARIO.github.io/examgen`

Espera 2-3 minutos para que GitHub Pages construya el sitio.

## Paso 4: Desplegar el Cloudflare Worker

### 4.1 Instalar Wrangler

```bash
npm install -g wrangler
```

### 4.2 Autenticarse con Cloudflare

```bash
wrangler login
```

Esto abrirá tu navegador para que inicies sesión en Cloudflare.

### 4.3 Configurar la API Key

```bash
cd worker
wrangler secret put GEMINI_API_KEY
```

Cuando se pida, pega tu API key de Gemini (obtenida en el Paso 1).

### 4.4 Instalar dependencias del Worker

```bash
npm install
```

### 4.5 Desplegar el Worker

```bash
npm run deploy
```

Cloudflare te mostrará una URL como:
```
https://examgen-worker.TU_USUARIO.workers.dev
```

**Guarda esta URL**, la necesitarás en el siguiente paso.

## Paso 5: Conectar Frontend y Backend

### 5.1 Actualizar la URL del Worker

1. Abre el archivo `client/src/pages/Home.tsx`
2. Busca la línea:
   ```typescript
   const workerUrl = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";
   ```
3. Reemplázala con:
   ```typescript
   const workerUrl = "https://examgen-worker.TU_USUARIO.workers.dev";
   ```
   (Usa la URL que Cloudflare te dio en el Paso 4.5)

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
