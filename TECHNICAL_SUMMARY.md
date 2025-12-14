# ExamGen - Resumen Técnico Completo

## Descripción General

**ExamGen** es un generador inteligente de exámenes universitarios que utiliza la API de Google Gemini para crear exámenes tipo test personalizados basados en el temario proporcionado por el usuario. La aplicación está diseñada con una arquitectura de dos capas: un frontend estático apto para GitHub Pages y un backend serverless en Cloudflare Workers.

## Arquitectura

### Frontend (Estático - GitHub Pages)
- **Tecnología:** React 19 + TypeScript + Tailwind CSS 4
- **Ubicación:** `/client`
- **Características principales:**
  - Interfaz responsiva y moderna
  - Formulario para seleccionar curso, asignatura, dificultad y número de preguntas
  - Carga de temario mediante textarea o archivo .txt
  - Visualización de examen con opciones tipo radio
  - Corrección automática con puntuación y explicaciones
  - Sin persistencia de datos (todo en memoria)

### Backend (Serverless - Cloudflare Worker)
- **Tecnología:** Cloudflare Worker + Node.js + TypeScript
- **Ubicación:** `/worker`
- **Endpoint:** `POST /api/generate`
- **Responsabilidades:**
  - Recibir solicitudes del frontend
  - Validar parámetros de entrada
  - Llamar a la API de Google Gemini
  - Procesar y validar la respuesta JSON
  - Retornar examen formateado al frontend

## Diseño Visual

**Enfoque:** Minimalismo Académico Moderno

- **Tipografía:**
  - Títulos: Playfair Display 700 (elegante, académico)
  - Cuerpo: Inter 400/500/600/700 (limpio, legible)

- **Paleta de Colores:**
  - Fondo: Blanco (#ffffff)
  - Texto principal: Gris oscuro (#1f2937)
  - Acento primario: Azul académico (#1e40af)
  - Bordes: Gris claro (#e5e7eb)
  - Inputs: Gris muy claro (#f9fafb)

- **Layout:**
  - Header con título y descripción
  - Formulario en tarjeta con sombra suave
  - Grid responsivo (2 columnas en desktop, 1 en mobile)
  - Espaciado generoso para respiración visual

## Estructura de Archivos

```
examgen/
├── client/                          # Frontend estático
│   ├── public/
│   │   └── images/                 # Assets estáticos
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Página principal (formulario + examen)
│   │   │   └── NotFound.tsx        # Página 404
│   │   ├── components/
│   │   │   ├── ui/                 # Componentes shadcn/ui
│   │   │   ├── ErrorBoundary.tsx   # Manejo de errores
│   │   │   └── Map.tsx             # Integración con Google Maps
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx    # Contexto de tema
│   │   ├── hooks/                  # Hooks personalizados
│   │   ├── lib/                    # Utilidades
│   │   ├── App.tsx                 # Componente raíz
│   │   ├── main.tsx                # Punto de entrada React
│   │   └── index.css               # Estilos globales
│   ├── index.html                  # HTML principal
│   ├── package.json                # Dependencias frontend
│   └── vite.config.ts              # Configuración Vite
│
├── worker/                          # Cloudflare Worker
│   ├── src/
│   │   └── index.ts                # Lógica del worker
│   ├── wrangler.toml               # Configuración Cloudflare
│   ├── tsconfig.json               # Configuración TypeScript
│   └── package.json                # Dependencias worker
│
├── server/                          # Placeholder (no usado en web-static)
├── shared/                          # Placeholder (no usado en web-static)
├── README.md                        # Documentación principal
├── DEPLOYMENT.md                    # Guía de despliegue paso a paso
├── TECHNICAL_SUMMARY.md             # Este archivo
├── ideas.md                         # Brainstorming de diseño
└── .gitignore                       # Archivos ignorados por Git
```

## Contrato de Datos

### Solicitud al Backend

```typescript
POST /api/generate
Content-Type: application/json

{
  "curso": "2º",                    // Curso universitario
  "asignatura": "Psicología Social", // Asignatura
  "dificultad": "media",            // "facil" | "media" | "dificil"
  "numeroPreguntas": 20,            // Número de preguntas (5-50)
  "temario": "Texto del temario..." // Contenido a estudiar
}
```

### Respuesta del Backend

```typescript
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
      "answerIndex": 1,              // Índice de la respuesta correcta (0-3)
      "explanation": "La psicología social se enfoca en cómo el contexto social..."
    }
    // ... más preguntas
  ]
}
```

## Flujo de Uso

1. **Usuario accede a la aplicación**
   - Carga el frontend desde GitHub Pages
   - Ve el formulario limpio y moderno

2. **Usuario completa el formulario**
   - Selecciona curso, asignatura, dificultad
   - Ingresa número de preguntas
   - Pega o carga el temario

3. **Usuario solicita generar examen**
   - Frontend valida que el temario no esté vacío
   - Envía solicitud POST al Cloudflare Worker
   - Muestra estado "Generando..."

4. **Backend procesa la solicitud**
   - Valida parámetros
   - Construye prompt para Gemini
   - Llama a la API de Gemini
   - Valida y formatea la respuesta JSON

5. **Frontend recibe el examen**
   - Renderiza las preguntas
   - Usuario responde seleccionando opciones
   - Usuario hace clic en "Corregir"

6. **Frontend corrige el examen**
   - Compara respuestas con respuestas correctas
   - Calcula puntuación
   - Muestra resultados y explicaciones
   - Usuario puede crear un nuevo examen

## Seguridad

### Protecciones Implementadas

1. **API Key Protegida**
   - La API key de Gemini se almacena en variables de entorno del Worker
   - Nunca se expone al navegador
   - No se registra en logs

2. **Validación de Entrada**
   - Validación de parámetros requeridos
   - Verificación de que el temario no esté vacío
   - Rango válido de número de preguntas (5-50)

3. **Validación de Salida**
   - Validación de estructura JSON de respuesta
   - Verificación de que cada pregunta tiene 4 opciones
   - Validación de índice de respuesta correcta

4. **CORS Configurado**
   - Permite solicitudes desde cualquier origen (configurable)
   - Manejo de preflight requests (OPTIONS)
   - Headers de seguridad apropiados

5. **Sin Persistencia**
   - No se guardan datos en base de datos
   - No se registran temarios ni respuestas
   - Cada sesión es independiente

## Dependencias Principales

### Frontend
- `react` (19.0.0) - Framework UI
- `react-dom` (19.0.0) - Renderizado DOM
- `typescript` (5.6.3) - Tipado estático
- `tailwindcss` (4.1.14) - Utilidades CSS
- `wouter` (3.3.5) - Enrutamiento ligero
- `lucide-react` (0.453.0) - Iconos
- `sonner` (2.0.7) - Notificaciones toast
- `shadcn/ui` - Componentes accesibles
- `vite` (7.1.7) - Bundler

### Backend (Worker)
- `@google/generative-ai` (0.3.0) - SDK de Gemini
- `@cloudflare/workers-types` (4.20240620.0) - Tipos de Cloudflare
- `typescript` (5.0.0) - Tipado estático
- `wrangler` (3.0.0) - CLI de Cloudflare

## Configuración de Ambiente

### Variables Requeridas

**Frontend:**
```
VITE_WORKER_URL=https://examgen-worker.TU_USUARIO.workers.dev
```

**Backend (Cloudflare Worker):**
```
GEMINI_API_KEY=AIzaSy... (tu API key de Google)
```

## Limitaciones Conocidas

1. **Dependencia de Gemini**
   - Si la API de Gemini está caída, no se pueden generar exámenes
   - Límites de cuota de Google Gemini aplican

2. **Calidad del Examen**
   - La calidad depende de la claridad del temario proporcionado
   - Gemini no puede inventar información fuera del temario

3. **Sin Persistencia**
   - Los exámenes no se guardan
   - No hay historial de exámenes anteriores
   - Cada sesión comienza desde cero

4. **Límites de Tamaño**
   - El temario tiene un límite de caracteres (según Gemini)
   - El número de preguntas está limitado a 5-50

## Próximas Mejoras Sugeridas

1. **Estadísticas de Desempeño**
   - Guardar resultados en localStorage
   - Mostrar gráficos de progreso
   - Historial de exámenes

2. **Más Tipos de Preguntas**
   - Preguntas de verdadero/falso
   - Preguntas de respuesta corta
   - Preguntas de opción múltiple con múltiples respuestas correctas

3. **Personalización**
   - Más asignaturas predefinidas
   - Temas personalizados
   - Estilos de examen personalizables

4. **Funcionalidades Avanzadas**
   - Exportar examen a PDF
   - Compartir examen con otros usuarios
   - Modo de práctica con retroalimentación inmediata
   - Análisis de debilidades

5. **Optimizaciones**
   - Caché de exámenes generados
   - Compresión de temario
   - Optimización de prompts para Gemini

## Comandos Útiles

### Desarrollo Frontend
```bash
cd client
npm install
npm run dev        # Servidor de desarrollo
npm run build      # Construir para producción
npm run preview    # Vista previa de producción
npm run check      # Verificar tipos TypeScript
npm run format     # Formatear código
```

### Desarrollo Backend
```bash
cd worker
npm install
npm run dev        # Servidor local del worker
npm run deploy     # Desplegar a Cloudflare
```

## Soporte y Documentación

- **README.md** - Documentación general y características
- **DEPLOYMENT.md** - Guía paso a paso para desplegar
- **ideas.md** - Brainstorming de diseño y decisiones
- **Código comentado** - Explicaciones en línea en archivos clave

## Autor

Creado con ❤️ para estudiantes universitarios que necesitan herramientas inteligentes para estudiar.

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024  
**Estado:** Listo para despliegue
