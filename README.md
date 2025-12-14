# ExamGen - Generador de Exámenes con Gemini

Un generador inteligente de exámenes universitarios que utiliza la API de Gemini para crear exámenes tipo test personalizados basados en el temario proporcionado.

## Características

- **Generación automática de exámenes** usando IA (Google Gemini)
- **Interfaz moderna y limpia** con diseño minimalista académico
- **Selección de dificultad** (Fácil, Media, Difícil)
- **Carga de temario** mediante textarea o archivo .txt
- **Corrección automática** con explicaciones por pregunta
- **Diseño responsive** apto para dispositivos móviles
- **Sin persistencia de datos** (todo se procesa en memoria)

## Arquitectura

### Frontend (GitHub Pages)
- **Tecnología:** React 19 + TypeScript + Tailwind CSS
- **Ubicación:** `/client`
- **Características:**
  - Interfaz estática apta para GitHub Pages
  - Formulario para seleccionar curso, asignatura, dificultad
  - Visualización y corrección de exámenes
  - Llamadas AJAX al backend serverless

### Backend (Cloudflare Worker)
- **Tecnología:** Cloudflare Worker + Google Gemini API
- **Ubicación:** `/worker`
- **Características:**
  - Endpoint POST `/api/generate` para generar exámenes
  - API key de Gemini protegida en variables de entorno
  - Validación de entrada y respuesta
  - CORS configurado para solicitudes del frontend

## Estructura del Proyecto

```
examgen/
├── client/                 # Frontend estático
│   ├── public/            # Assets estáticos
│   ├── src/
│   │   ├── pages/         # Componentes de página
│   │   ├── components/    # Componentes reutilizables
│   │   ├── App.tsx        # Componente raíz
│   │   └── index.css      # Estilos globales
│   └── index.html         # HTML principal
├── worker/                 # Cloudflare Worker
│   ├── src/
│   │   └── index.ts       # Lógica del worker
│   ├── wrangler.toml      # Configuración de Cloudflare
│   └── package.json       # Dependencias
└── README.md              # Este archivo
```

## Instalación y Despliegue

### Requisitos Previos

- Node.js 18+ y npm/pnpm
- Cuenta de Cloudflare
- Cuenta de Google Cloud (para API key de Gemini)
- Repositorio en GitHub

### Paso 1: Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Crea una nueva API key
3. Guarda la clave (la necesitarás para desplegar el Worker)

### Paso 2: Desplegar el Frontend en GitHub Pages

1. Crea un repositorio en GitHub llamado `examgen` (o el nombre que prefieras)

2. Clona el repositorio:
```bash
git clone https://github.com/TU_USUARIO/examgen.git
cd examgen
```

3. Copia los archivos del frontend:
```bash
cp -r client/* .
```

4. Instala dependencias:
```bash
npm install
# o
pnpm install
```

5. Construye el proyecto:
```bash
npm run build
```

6. Configura GitHub Pages:
   - Ve a Settings → Pages
   - Selecciona "Deploy from a branch"
   - Selecciona rama `main` y carpeta `dist`

7. Haz push del código:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Tu frontend estará disponible en: `https://TU_USUARIO.github.io/examgen`

### Paso 3: Desplegar el Cloudflare Worker

1. Instala Wrangler:
```bash
npm install -g wrangler
```

2. Auténticate con Cloudflare:
```bash
wrangler login
```

3. Ve a la carpeta del worker:
```bash
cd worker
```

4. Instala dependencias:
```bash
npm install
```

5. Configura la variable de entorno:
```bash
wrangler secret put GEMINI_API_KEY
# Pega tu API key cuando se pida
```

6. Despliega el worker:
```bash
npm run deploy
```

Cloudflare te dará una URL como: `https://examgen-worker.TU_USUARIO.workers.dev`

### Paso 4: Configurar la URL del Worker en el Frontend

1. En el frontend, edita `client/src/pages/Home.tsx`
2. Busca la línea: `const workerUrl = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";`
3. Reemplaza con tu URL del worker:
```typescript
const workerUrl = "https://examgen-worker.TU_USUARIO.workers.dev";
```

4. Reconstruye y despliega:
```bash
npm run build
git add .
git commit -m "Update worker URL"
git push origin main
```

## Desarrollo Local

### Frontend

```bash
cd client
npm install
npm run dev
```

El servidor estará en `http://localhost:5173`

### Worker (Local)

```bash
cd worker
npm install
npm run dev
```

El worker estará en `http://localhost:8787`

Para probar, puedes usar:
```bash
curl -X POST http://localhost:8787/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "curso": "2º",
    "asignatura": "Psicología Social",
    "dificultad": "media",
    "numeroPreguntas": 5,
    "temario": "La psicología social estudia el comportamiento humano en contextos sociales..."
  }'
```

## Contrato de Datos

### Solicitud POST `/api/generate`

```json
{
  "curso": "2º",
  "asignatura": "Psicología Social",
  "dificultad": "media",
  "numeroPreguntas": 20,
  "temario": "Texto del temario aquí..."
}
```

### Respuesta (Examen)

```json
{
  "title": "Examen - Psicología Social (2º)",
  "difficulty": "media",
  "questions": [
    {
      "id": 1,
      "question": "¿Cuál es el concepto principal de la psicología social?",
      "choices": [
        "El estudio del comportamiento individual",
        "El estudio del comportamiento en contextos sociales",
        "El estudio de la neurobiología",
        "El estudio de la historia"
      ],
      "answerIndex": 1,
      "explanation": "La psicología social se enfoca en cómo el contexto social influye en el comportamiento individual..."
    }
  ]
}
```

## Seguridad

- **API Key protegida:** La API key de Gemini se almacena en variables de entorno del Worker, nunca se expone al navegador
- **Validación de entrada:** Se valida que el temario no esté vacío y que los parámetros sean válidos
- **CORS configurado:** Solo se aceptan solicitudes desde orígenes autorizados
- **Sin persistencia:** Los datos no se guardan en base de datos

## Limitaciones Conocidas

- **Dependencia de Gemini:** Si la API de Gemini está caída, no se pueden generar exámenes
- **Límites de cuota:** Google Gemini tiene límites de solicitudes (consulta la documentación)
- **Calidad del temario:** La calidad del examen depende de la calidad y claridad del temario proporcionado

## Solución de Problemas

### El examen no se genera
1. Verifica que el temario no esté vacío
2. Comprueba que la URL del Worker sea correcta
3. Revisa la consola del navegador (F12) para ver errores CORS
4. Verifica que la API key de Gemini sea válida

### Error CORS
1. Asegúrate de que el Worker tiene CORS configurado
2. Verifica que la URL del frontend esté permitida

### Error de API key
1. Verifica que la variable `GEMINI_API_KEY` esté configurada en Cloudflare
2. Usa `wrangler secret list` para confirmar que está presente

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## Licencia

MIT

## Autor

Creado con ❤️ para estudiantes universitarios
