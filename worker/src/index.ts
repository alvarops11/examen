import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Cloudflare Worker para ExamGen
 * Endpoint: POST /api/generate
 * 
 * Seguridad:
 * - API key de Gemini en variable de entorno (no expuesta al navegador)
 * - CORS configurado para permitir solicitudes del frontend
 * - Validación de entrada
 */

interface ExamQuestion {
  id: number;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

interface ExamResponse {
  title: string;
  difficulty: string;
  questions: ExamQuestion[];
}

interface GenerateRequest {
  curso: string;
  dificultad: string;
  numeroPreguntas: number;
  temario: string;
}

// Función para generar el prompt para Gemini
function generatePrompt(
  temario: string,
  curso: string,
  dificultad: string,
  numeroPreguntas: number
): string {
  const dificultadDescripcion = {
    facil: "preguntas fáciles que evalúen conceptos básicos",
    media: "preguntas de dificultad media que evalúen comprensión y aplicación",
    dificil: "preguntas difíciles que evalúen análisis, síntesis y pensamiento crítico",
  };

  return `Eres un profesor universitario experto en crear exámenes de calidad.

Tu tarea es generar un examen tipo test basado ÚnicAMENTE en el temario proporcionado.

INSTRUCCIONES CRÍTICAS:
1. Usa SOLO la información del temario. NO inventes datos ni añadas información externa.
2. Si el temario es incompleto, formula preguntas más generales basadas en lo dado.
3. Genera exactamente ${numeroPreguntas} preguntas.
4. Nivel: ${dificultadDescripcion[dificultad as keyof typeof dificultadDescripcion]}
5. Cada pregunta debe tener 4 opciones (A, B, C, D).
6. Devuelve SOLO JSON válido, sin texto adicional.

TEMARIO:
${temario}

IMPORTANTE: Si el temario contiene caracteres extraños, metadatos de PDF (como /Type /Page), números de línea sueltos o código, IGNÓRALOS COMPLETAMENTE y céntrate solo en el texto educativo y comprensible.

Devuelve un JSON exactamente en este formato (sin markdown, sin explicaciones adicionales):
{
  "title": "Examen (${curso})",
  "difficulty": "${dificultad}",
  "questions": [
    {
      "id": 1,
      "question": "Pregunta aquí",
      "choices": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "answerIndex": 0,
      "explanation": "Explicación detallada de por qué esta es la respuesta correcta"
    }
  ]
}

Genera el examen ahora:`;
}

// Función para extraer JSON de la respuesta
function extractJSON(text: string): ExamResponse {
  // Intentar encontrar JSON en la respuesta
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No se pudo extraer JSON de la respuesta de Gemini");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed as ExamResponse;
}

// Función para validar la respuesta
function validateResponse(data: any): data is ExamResponse {
  return (
    data &&
    typeof data === "object" &&
    typeof data.title === "string" &&
    typeof data.difficulty === "string" &&
    Array.isArray(data.questions) &&
    data.questions.length > 0 &&
    data.questions.every(
      (q: any) =>
        typeof q.id === "number" &&
        typeof q.question === "string" &&
        Array.isArray(q.choices) &&
        q.choices.length === 4 &&
        typeof q.answerIndex === "number" &&
        q.answerIndex >= 0 &&
        q.answerIndex < 4 &&
        typeof q.explanation === "string"
    )
  );
}

// Manejador de CORS
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Manejador principal
async function handleRequest(request: Request): Promise<Response> {
  // Manejar preflight CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // Solo aceptar POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  }

  try {
    // Parsear el body
    const body: GenerateRequest = await request.json();

    // Validar entrada
    if (
      !body.temario ||
      !body.curso ||
      !body.dificultad ||
      !body.numeroPreguntas
    ) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros requeridos" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    if (body.temario.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "El temario no puede estar vacío" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    // Obtener API key desde variables de entorno
    const apiKey = (process.env as any).GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY no está configurada");
      return new Response(
        JSON.stringify({ error: "Error de configuración del servidor" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    // Inicializar cliente de Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generar prompt
    const prompt = generatePrompt(
      body.temario,
      body.curso,
      body.dificultad,
      body.numeroPreguntas
    );

    // Llamar a Gemini
    const result = await model.generateContent(prompt);
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!responseText) {
      throw new Error("Respuesta vacía de Gemini");
    }

    // Extraer y validar JSON
    const examData = extractJSON(responseText);

    if (!validateResponse(examData)) {
      throw new Error("Respuesta de Gemini no válida");
    }

    // Retornar respuesta
    return new Response(JSON.stringify(examData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return new Response(
      JSON.stringify({
        error: "Error al generar el examen",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

// Exportar para Cloudflare Workers
export default {
  fetch: handleRequest,
};
