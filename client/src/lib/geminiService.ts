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
 * Genera un examen usando OpenRouter API
 * El temario se envía directamente para que genere preguntas de calidad
 */
// Helper para dividir el texto en chunks sin cortar párrafos
function splitText(text: string, maxChunkSize = 12000): string[] {
  if (text.length <= maxChunkSize) return [text];

  const chunks: string[] = [];
  let currentChunk = "";
  // Dividir por párrafos dobles o saltos de línea para conservar contexto
  const paragraphs = text.split(/\n\n+/);

  for (const p of paragraphs) {
    if ((currentChunk + "\n\n" + p).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = p;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + p;
    }
  }

  // Agregar el último trozo si existe
  if (currentChunk) chunks.push(currentChunk);

  // Si algo falló y no hay chunks, devolver el original
  return chunks.length > 0 ? chunks : [text];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateExamWithOpenRouter(
  apiKey: string,
  curso: string,
  dificultad: string,
  numeroPreguntas: number,
  temario: string
): Promise<ExamResponse> {
  const model = "nex-agi/deepseek-v3.1-nex-n1:free";

  const dificultadMap = {
    facil: "básicos y conceptos fundamentales",
    media: "comprensión, aplicación y análisis de conceptos",
    dificil: "análisis profundo, síntesis y pensamiento crítico a nivel universitario",
  };

  // 1. Dividir el temario en chunks
  const chunks = splitText(temario);
  console.log(`[ExamSphere] Temario dividido en ${chunks.length} partes para optimización.`);

  let allQuestions: ExamQuestion[] = [];

  // Distribución de preguntas
  const totalChunks = chunks.length;
  // Preguntas base por chunk
  const baseQuestions = Math.floor(numeroPreguntas / totalChunks);
  // El resto se reparte entre los primeros chunks
  const remainder = numeroPreguntas % totalChunks;

  for (let i = 0; i < totalChunks; i++) {
    const questionsForThisChunk = baseQuestions + (i < remainder ? 1 : 0);

    // Si un chunk es muy pequeño y no le tocan preguntas, saltar (aunque el split debería balancear)
    if (questionsForThisChunk <= 0) continue;

    console.log(`[ExamSphere] Procesando parte ${i + 1}/${totalChunks} (${questionsForThisChunk} preguntas)...`);

    const chunkContent = chunks[i];

    const systemPrompt = `Eres un profesor universitario experto en crear exámenes de calidad.
Tu tarea es generar ${questionsForThisChunk} preguntas de tipo test basadas EXCLUSIVAMENTE en el fragmento del temario proporcionado.

Instrucciones de formato:
1. Devuelve SOLO JSON válido.
2. NO incluyas markdown.
3. Asegúrate de que la respuesta correcta NO sea sistemáticamente la opción más larga. Varía la longitud y posición de las respuestas correctas.
4. El JSON debe ser así:
{
  "questions": [
    {
      "id": 1,
      "question": "Pregunta...",
      "choices": ["A", "B", "C", "D"],
      "answerIndex": 0,
      "explanation": "Explicación breve"
    }
  ]
}`;

    const userPrompt = `Genera ${questionsForThisChunk} preguntas para el curso ${curso} nivel ${dificultadMap[dificultad as keyof typeof dificultadMap]}.
    
FRAGMENTO DE TEMARIO (${i + 1}/${totalChunks}):
${chunkContent}

RECORDATORIO: Devuelve SOLO el JSON con la propiedad "questions".`;

    try {
      // Pequeña pausa para no saturar 429 en modelos gratuitos si hay múltipes chunks
      if (i > 0) await wait(2000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://examsphere.app",
          "X-Title": "ExamSphere",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Error en chunk ${i + 1}:`, errorData);
        // Si falla un chunk, lanzamos error para que el usuario sepa que no se pudo completar
        // Opcional: Podríamos continuar con lo que tenemos, pero mejor integridad.
        throw new Error(`Error del proveedor en la parte ${i + 1}: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";

      // Limpieza
      content = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          allQuestions = [...allQuestions, ...parsed.questions];
        }
      }

    } catch (error) {
      console.error(`Fallo al procesar chunk ${i + 1}`, error);
      throw error;
    }
  }

  // Post-procesamiento: Reasignar IDs consecutivos
  const finalQuestions = allQuestions.map((q, index) => ({
    ...q,
    id: index + 1
  }));

  if (finalQuestions.length === 0) {
    throw new Error("No se pudieron generar preguntas válidas.");
  }

  return {
    title: `Examen - ${curso}`,
    difficulty: dificultad,
    questions: finalQuestions
  };
}
