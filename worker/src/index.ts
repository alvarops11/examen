
export interface Env {
  OPENROUTER_API_KEY: string;
}

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

// Helper para dividir el texto en chunks sin cortar párrafos
function splitText(text: string, maxChunkSize = 8000): string[] {
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

  if (currentChunk) chunks.push(currentChunk);
  return chunks.length > 0 ? chunks : [text];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
    }

    try {
      const apiKey = env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Server misconfiguration: Missing API Key" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }

      const body = await request.json() as GenerateRequest;
      const { curso, dificultad, numeroPreguntas, temario } = body;

      if (!temario || !temario.trim()) {
        return new Response(JSON.stringify({ error: "Temario requerido" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }

      const model = "nex-agi/deepseek-v3.1-nex-n1:free"; // Using the free model
      const dificultadMap: Record<string, string> = {
        facil: "básicos y conceptos fundamentales",
        media: "comprensión, aplicación y análisis de conceptos",
        dificil: "análisis profundo, síntesis y pensamiento crítico a nivel universitario",
      };

      const chunks = splitText(temario);
      let allQuestions: ExamQuestion[] = [];

      const totalChunks = chunks.length;
      const baseQuestions = Math.floor(numeroPreguntas / totalChunks);
      const remainder = numeroPreguntas % totalChunks;

      for (let i = 0; i < totalChunks; i++) {
        const questionsForThisChunk = baseQuestions + (i < remainder ? 1 : 0);
        if (questionsForThisChunk <= 0) continue;

        const chunkContent = chunks[i];

        const systemPrompt = `Eres un profesor universitario experto en crear exámenes de calidad.
Tu tarea es generar ${questionsForThisChunk} preguntas de tipo test basadas EXCLUSIVAMENTE en el fragmento del temario proporcionado.

REGLAS DE ORO DE "ANTI-PATRONES" (ESTRICTO):
1. **LONGITUD INVERSA:** La respuesta correcta NO PUEDE ser la más larga. Debes hacer que al menos una respuesta incorrecta sea MÁS LARGA que la correcta.
2. **CONCISIÓN:** La respuesta correcta debe ser precisa y directa.
3. **DISTRACTORES ELABORADOS:** Los distractores deben sonar convincentes, técnicos y bien desarrollados.
4. **MODO ALEATORIO:** Varía tu estilo. A veces la correcta es corta, a veces media, pero raramente la más larga del grupo.

Instrucciones de formato:
1. Devuelve SOLO JSON válido.
2. NO incluyas markdown.
3. El JSON debe ser así:
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

        const userPrompt = `Genera ${questionsForThisChunk} preguntas para el curso ${curso} nivel ${dificultadMap[dificultad] || "medio"}.
    
FRAGMENTO DE TEMARIO (${i + 1}/${totalChunks}):
${chunkContent}

RECORDATORIO: Devuelve SOLO el JSON con la propiedad "questions".`;

        // Retries for robustness
        let attempts = 0;
        let success = false;
        while (attempts < 3 && !success) {
          try {
            if (i > 0 && attempts === 0) await wait(1000); // Rate limit spacing

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://examsphere.app", // Optional
                "X-Title": "ExamSphere", // Optional
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
              const errText = await response.text();
              console.error(`OpenRouter error chunk ${i}: ${response.status} - ${errText}`);
              throw new Error(`OpenRouter API error: ${response.status}`);
            }

            const data: any = await response.json();
            let content = data.choices?.[0]?.message?.content || "";
            content = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");

            // Extract JSON object
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.questions && Array.isArray(parsed.questions)) {
                // MEJORA CRÍTICA: Aleatorizar respuestas aquí mismo para evitar sesgo de posición del modelo
                const processedQuestions = parsed.questions.map((q: any) => {
                  const choices = [...q.choices]; // Copia del array
                  const correctChoice = choices[q.answerIndex];

                  // Shuffling choices (Fisher-Yates)
                  for (let j = choices.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [choices[j], choices[k]] = [choices[k], choices[j]];
                  }

                  // Find new index
                  const newAnswerIndex = choices.indexOf(correctChoice);

                  return {
                    ...q,
                    choices: choices,
                    answerIndex: newAnswerIndex
                  };
                });

                allQuestions = [...allQuestions, ...processedQuestions];
                success = true;
              } else {
                throw new Error("Invalid JSON structure");
              }
            } else {
              throw new Error("No JSON found in response");
            }

          } catch (e) {
            console.error(`Attempt ${attempts + 1} failed for chunk ${i}:`, e);
            attempts++;
            await wait(2000 * attempts); // Exponential backoff
          }
        }
      }

      if (allQuestions.length === 0) {
        return new Response(JSON.stringify({ error: "No se pudieron generar preguntas." }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }

      // Re-index IDs
      const finalQuestions = allQuestions.map((q, index) => ({
        ...q,
        id: index + 1
      }));

      const responseData: ExamResponse = {
        title: `Examen - ${curso}`,
        difficulty: dificultad,
        questions: finalQuestions
      };

      return new Response(JSON.stringify(responseData), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }
  },
};
