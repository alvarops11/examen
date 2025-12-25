
export interface Env {
  OPENROUTER_API_KEY: string;
  OPENROUTER_API_KEY_BACKUP?: string;
  STATS_KV: KVNamespace;
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
  numeroRespuestas: number;
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
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Helper for stats tracking
async function incrementStat(kv: KVNamespace, key: string, amount: number = 1) {
  try {
    const current = await kv.get(key) || "0";
    await kv.put(key, (parseInt(current) + amount).toString());
  } catch (e) {
    console.error(`Error updating stat ${key}:`, e);
  }
}

async function incrementStatDaily(kv: KVNamespace, type: string, amount: number = 1) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await incrementStat(kv, `${type}:${today}`, amount);
  await incrementStat(kv, `${type}:${thisMonth}`, amount);
  await incrementStat(kv, `${type}:all`, amount);
}

// Helper para hacer fetch con retry y failover
async function fetchWithFailover(
  url: string,
  options: RequestInit,
  env: Env
): Promise<Response> {
  const keys = [env.OPENROUTER_API_KEY];
  if (env.OPENROUTER_API_KEY_BACKUP) {
    keys.push(env.OPENROUTER_API_KEY_BACKUP);
  }

  for (const apiKey of keys) {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${apiKey}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Si es exitoso o es un error de cliente (400) que no sea auth/rate limit, retornamos
      if (response.ok || (response.status >= 400 && response.status < 500 && ![401, 403, 429].includes(response.status))) {
        return response;
      }

      console.warn(`API Key falló con status ${response.status}. Intentando siguiente key si existe...`);
    } catch (error) {
      console.warn(`Error de red con API Key. Intentando siguiente key...`, error);
    }
  }

  // Si todas fallan, lanzar error
  throw new Error("Todas las API keys fallaron. Servicio no disponible temporalmente.");
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // Stats Endpoint (GET /api/stats)
    if (url.pathname === "/api/stats" && request.method === "GET") {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const stats = {
        visitors: {
          today: parseInt(await env.STATS_KV.get(`v:${today}`) || "0"),
          month: parseInt(await env.STATS_KV.get(`v:${thisMonth}`) || "0"),
          total: parseInt(await env.STATS_KV.get(`v:all`) || "0"),
        },
        exams: {
          today: parseInt(await env.STATS_KV.get(`e:${today}`) || "0"),
          month: parseInt(await env.STATS_KV.get(`e:${thisMonth}`) || "0"),
          total: parseInt(await env.STATS_KV.get(`e:all`) || "0"),
        },
        difficulties: {
          facil: parseInt(await env.STATS_KV.get(`diff:facil`) || "0"),
          media: parseInt(await env.STATS_KV.get(`diff:media`) || "0"),
          dificil: parseInt(await env.STATS_KV.get(`diff:dificil`) || "0"),
        },
        courses: {
          "1º": parseInt(await env.STATS_KV.get(`course:1º`) || "0"),
          "2º": parseInt(await env.STATS_KV.get(`course:2º`) || "0"),
          "3º": parseInt(await env.STATS_KV.get(`course:3º`) || "0"),
          "4º": parseInt(await env.STATS_KV.get(`course:4º`) || "0"),
          "Máster": parseInt(await env.STATS_KV.get(`course:Máster`) || "0"),
        },
        technical: {
          total_questions: parseInt(await env.STATS_KV.get(`stats:total_questions`) || "0"),
          total_gen_time: parseInt(await env.STATS_KV.get(`stats:total_gen_time`) || "0"),
        },
        events: {
          pdf_normal: parseInt(await env.STATS_KV.get(`event:pdf_normal`) || "0"),
          pdf_corrected: parseInt(await env.STATS_KV.get(`event:pdf_corrected`) || "0"),
        }
      };

      return new Response(JSON.stringify(stats), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    // Track Visit Endpoint (POST /api/track-visit)
    if (url.pathname === "/api/track-visit" && request.method === "POST") {
      ctx.waitUntil(incrementStatDaily(env.STATS_KV, 'v'));
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    // Track Event Endpoint (POST /api/track-event)
    if (url.pathname === "/api/track-event" && request.method === "POST") {
      const { event } = await request.json() as { event: string };
      if (event) {
        ctx.waitUntil(incrementStat(env.STATS_KV, `event:${event}`));
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    // Existing Generate Endpoint
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
    }

    try {
      const startTime = Date.now();
      if (!env.OPENROUTER_API_KEY) {
        return new Response(JSON.stringify({ error: "Server misconfiguration: Missing API Key" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }

      const body = await request.json() as GenerateRequest;
      const { curso, dificultad, numeroPreguntas, numeroRespuestas, temario } = body;

      if (!temario || !temario.trim()) {
        return new Response(JSON.stringify({ error: "Temario requerido" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }

      const model = "xiaomi/mimo-v2-flash:free";
      const dificultadMap: Record<string, string> = {
        facil: "básicos y conceptos fundamentales",
        media: "comprensión, aplicación y análisis de conceptos",
        dificil: "análisis profundo, síntesis y pensamiento crítico a nivel universitario",
      };

      // OPTIMIZACIÓN: Reducción de MaxChunkSize para mayor paralelismo (de 8000 a 3000)
      const chunks = splitText(temario, 3000);
      let allQuestions: ExamQuestion[] = [];

      const totalChunks = chunks.length;
      const baseQuestions = Math.floor(numeroPreguntas / totalChunks);
      const remainder = numeroPreguntas % totalChunks;

      const chunkPromises = chunks.map(async (chunkContent, i) => {
        const questionsForThisChunk = baseQuestions + (i < remainder ? 1 : 0);
        if (questionsForThisChunk <= 0) return [];

        const systemPrompt = `Eres una inteligencia artificial que actúa como un profesor universitario experto en evaluación académica. Tu único objetivo es generar preguntas de opción múltiple perfectamente válidas para un examen oficial, a partir de un fragmento de temario que se te proporcionará. No eres un asistente general ni un generador creativo. Eres un evaluador experto.

Comportamiento general:
- Actúa como un docente universitario con experiencia en evaluación rigurosa.
- Evalúa solo con base en el contenido proporcionado. No completes lagunas, no infieras, no añadas ejemplos no presentes.

Uso del temario (REGLA DE ORO):
- Usa EXCLUSIVAMENTE la información contenida en el fragmento de temario proporcionado.
- Todas las preguntas, opciones y explicaciones deben ser trazables directamente al texto.
- Está terminantemente prohibido usar conocimientos externos o inventar contenidos.
- PROHIBICIÓN DE REFERENCIAS INTERNAS: No menciones jamás identificadores de documentos, números de página, anexos o referencias cruzadas que aparezcan en el texto original (ej. "según el Doc. 48", "como indica la tabla 2", "véase pág 12"). El alumno NO ve el texto original, solo ve la pregunta. La pregunta debe ser 100% autodependiente.
- Si alguna pregunta requiere una cita o parte del temario para su comprensión, ese fragmento debe estar integrado literalmente dentro del enunciado de la pregunta.

Generación de examen:
- Genera exactamente ${questionsForThisChunk} preguntas.
- Cada pregunta tendrá exactamente ${numeroRespuestas || 4} opciones.
- Solo una opción es correcta, indicada en el campo answerIndex.

Redacción del enunciado:
- Plantea una única cuestión clara.
- El enunciado debe entenderse sin necesidad de leer las opciones.
- Usa lenguaje académico, sin vaguedades ni pistas implícitas.
- EJEMPLO PROHIBIDO: "¿Qué dice el Doc. 48 sobre...?"
- EJEMPLO CORRECTO: "¿Qué aspecto cultural llegó al territorio vasco a través del Camino de Santiago?" (eliminando la referencia al documento).

Reglas críticas anti-sesgo de longitud:
- La opción correcta no debe ser distinguible por longitud, tecnicismo o complejidad.
- Si una opción es más larga o más técnica → debe ser un distractor incorrecto.
- Todas las opciones deben ser visualmente simétricas (±5% de caracteres).
- Todas las opciones deben seguir la misma estructura gramatical y sintáctica.
- Está prohibido incluir aclaraciones, “porque…”, o definiciones dentro de las opciones.

Sobre los distractores:
- Todos los distractores deben ser plausibles y relacionados con el temario.
- Deben fallar por errores conceptuales sutiles, no por ser absurdos o evidentes.
- Evita pistas internas como absolutos solo en distractores o repetir palabras del enunciado solo en la correcta.

Explicación:
- Cada pregunta debe incluir una explicación breve, objetiva y académica que justifique solo la opción correcta.
- No se deben explicar los distractores.
- No se debe introducir información nueva.

Formato de salida:
- La salida debe ser un objeto JSON válido, sin ningún texto adicional, con la siguiente estructura exacta:
{
  "questions": [
    {
      "id": 1,
      "question": "Texto del enunciado claro y académico. Si se requiere citar un fragmento, debe ir aquí.",
      "choices": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "answerIndex": 2,
      "explanation": "Frase breve y justificada únicamente con el temario."
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
        let chunkQuestions: ExamQuestion[] = [];

        while (attempts < 3 && !success) {
          try {
            // Add slight jittered delay to avoid hitting rate limits exactly at the same time
            if (attempts > 0) await wait(1000 * attempts + Math.random() * 1000);

            const response = await fetchWithFailover("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "HTTP-Referer": "https://examsphere.app",
                "X-Title": "ExamSphere",
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
              })
            }, env);

            if (!response.ok) {
              const errText = await response.text();
              console.error(`OpenRouter error chunk ${i}: ${response.status} - ${errText}`);
              throw new Error(`OpenRouter API error: ${response.status}`);
            }

            const data: any = await response.json();
            let content = data.choices?.[0]?.message?.content || "";
            content = content.replace(/```json/g, "").replace(/```/g, "").trim();

            let parsed: any;
            try {
              parsed = JSON.parse(content);
            } catch (e) {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  parsed = JSON.parse(jsonMatch[0]);
                } catch (e2) {
                  console.error("Failed to parse regex match", e2);
                }
              }
            }

            if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
              chunkQuestions = parsed.questions.map((q: any) => {
                const choices = [...q.choices];
                const correctChoice = choices[q.answerIndex];
                for (let j = choices.length - 1; j > 0; j--) {
                  const k = Math.floor(Math.random() * (j + 1));
                  [choices[j], choices[k]] = [choices[k], choices[j]];
                }
                let newAnswerIndex = choices.indexOf(correctChoice);
                if (newAnswerIndex === -1) newAnswerIndex = 0;
                return {
                  ...q,
                  choices: choices,
                  answerIndex: newAnswerIndex
                };
              });
              success = true;
            } else {
              throw new Error("Invalid JSON structure");
            }
          } catch (e) {
            console.error(`Attempt ${attempts + 1} failed for chunk ${i}:`, e);
            attempts++;
          }
        }
        return chunkQuestions;
      });

      const results = await Promise.all(chunkPromises);
      allQuestions = results.flat();

      if (allQuestions.length === 0) {
        return new Response(JSON.stringify({ error: "No se pudieron generar preguntas." }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }

      // TRACK EXAM GENERATION AND METRICS (NON-BLOCKING with ctx.waitUntil)
      const duration = Date.now() - startTime;
      ctx.waitUntil((async () => {
        await incrementStatDaily(env.STATS_KV, 'e');
        await incrementStat(env.STATS_KV, `diff:${dificultad}`);
        await incrementStat(env.STATS_KV, `course:${curso}`);
        await incrementStat(env.STATS_KV, `stats:total_questions`, allQuestions.length);
        await incrementStat(env.STATS_KV, `stats:total_gen_time`, duration);
      })());

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
