import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExamQuestion {
  id: number;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface ExamResponse {
  title: string;
  difficulty: string;
  questions: ExamQuestion[];
}

/**
 * Genera un examen usando Google Gemini API
 * El temario se envía directamente a Gemini para que genere preguntas de calidad
 */
export async function generateExamWithGemini(
  apiKey: string,
  curso: string,
  dificultad: string,
  numeroPreguntas: number,
  temario: string
): Promise<ExamResponse> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const dificultadMap = {
    facil: "básicos y conceptos fundamentales",
    media: "comprensión, aplicación y análisis de conceptos",
    dificil: "análisis profundo, síntesis y pensamiento crítico a nivel universitario",
  };

  const prompt = `INSTRUCCIONES CRÍTICAS PARA GENERAR EXAMEN UNIVERSITARIO:

Tu tarea ÚNICA es generar un examen tipo test basado EXCLUSIVAMENTE en el temario proporcionado.

TEMARIO PROPORCIONADO:
${temario}

=== REQUISITOS OBLIGATORIOS ===

1. CONTENIDO:
   - Usa SOLO información del temario proporcionado
   - NO inventes datos, conceptos o información externa
   - Si el temario es incompleto, formula preguntas más generales basadas en lo dado
   - Evita preguntas que requieran información fuera del temario

2. CANTIDAD Y VARIEDAD:
   - Genera EXACTAMENTE ${numeroPreguntas} preguntas
   - Cada pregunta debe ser diferente
   - Cubre diferentes temas/secciones del temario
   - Evita repetir preguntas o conceptos

3. DIFICULTAD (NIVEL UNIVERSITARIO):
   - Nivel: ${dificultadMap[dificultad as keyof typeof dificultadMap]}
   - Adapta la complejidad del lenguaje y conceptos al nivel seleccionado

4. ESTRUCTURA DE CADA PREGUNTA:
   - 1 pregunta clara y concisa
   - EXACTAMENTE 4 opciones de respuesta
   - Las opciones deben ser plausibles pero claramente diferenciables
   - La respuesta correcta debe variar de posición (no siempre la primera o última)
   - 1 explicación breve (máximo 2 líneas) de por qué es correcta

5. FORMATO DE SALIDA:
   - Devuelve SOLO JSON válido
   - SIN markdown, SIN bloques de código, SIN explicaciones adicionales
   - JSON debe ser parseable directamente

=== FORMATO JSON EXACTO ===
{
  "title": "Examen - ${curso}",
  "difficulty": "${dificultad}",
  "questions": [
    {
      "id": 1,
      "question": "Pregunta clara basada en el temario",
      "choices": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "answerIndex": 0,
      "explanation": "Explicación breve basada en el temario"
    }
  ]
}

GENERA EL EXAMEN AHORA. RESPONDE SOLO CON JSON.`;

  try {
    let result;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (error: any) {
        if (error?.message?.includes("429") || error?.message?.includes("quota")) {
          retries++;
          if (retries < maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000;
            console.log(
              `Cuota excedida. Reintentando en ${waitTime / 1000}s (intento ${retries}/${maxRetries})...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          } else {
            throw new Error(
              "Se excedió el límite de cuota de Gemini. Por favor, intenta más tarde o usa otra API key."
            );
          }
        } else {
          throw error;
        }
      }
    }

    const responseText =
      result?.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!responseText) {
      throw new Error("No se recibió respuesta de Gemini");
    }

    // Extraer JSON de la respuesta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se encontró JSON válido en la respuesta");
    }

    const examData: ExamResponse = JSON.parse(jsonMatch[0]);

    // Validar que el examen tenga el número correcto de preguntas
    if (examData.questions.length !== numeroPreguntas) {
      console.warn(
        `Se esperaban ${numeroPreguntas} preguntas pero se generaron ${examData.questions.length}`
      );
    }

    // Validar que cada pregunta tenga 4 opciones
    examData.questions.forEach((q, index) => {
      if (q.choices.length !== 4) {
        throw new Error(
          `Pregunta ${index + 1} no tiene exactamente 4 opciones`
        );
      }
      if (q.answerIndex < 0 || q.answerIndex > 3) {
        throw new Error(
          `Pregunta ${index + 1} tiene un índice de respuesta inválido`
        );
      }
    });

    return examData;
  } catch (error) {
    console.error("Error al generar examen con Gemini:", error);
    throw error;
  }
}
