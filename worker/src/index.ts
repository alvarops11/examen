
export interface Env {
  OPENROUTER_API_KEY: string;
  OPENROUTER_API_KEY_BACKUP_1?: string;
  OPENROUTER_API_KEY_BACKUP_2?: string;
  OPENROUTER_API_KEY_BACKUP_3?: string;
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

// Helper para hacer fetch con retry y failover mejorado
async function fetchWithFailover(
  url: string,
  options: RequestInit,
  env: Env,
  modelName: string
): Promise<Response> {
  const keys = [env.OPENROUTER_API_KEY];
  if (env.OPENROUTER_API_KEY_BACKUP_1) keys.push(env.OPENROUTER_API_KEY_BACKUP_1);
  if (env.OPENROUTER_API_KEY_BACKUP_2) keys.push(env.OPENROUTER_API_KEY_BACKUP_2);
  if (env.OPENROUTER_API_KEY_BACKUP_3) keys.push(env.OPENROUTER_API_KEY_BACKUP_3);

  let lastErrorMsg = "Servicio no disponible temporalmente.";

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${apiKey}`);

    // LOG: Intento con key específica
    console.log(`[Worker] Intentando modelo ${modelName} con API Key ${i + 1}/${keys.length}...`);

    try {
      // Implementamos un timeout de 60 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Si es exitoso o es un error de cliente (400) que no sea auth/rate limit, retornamos
      if (response.ok || (response.status >= 400 && response.status < 500 && ![401, 403, 429].includes(response.status))) {
        if (response.ok) console.log(`[Worker] Éxito con modelo ${modelName} y Key ${i + 1}.`);
        return response;
      }

      console.warn(`[Worker] API Key ${i + 1} falló con status ${response.status}.`);
      lastErrorMsg = `HTTP ${response.status} ${response.statusText}`;
      if (response.status === 429) lastErrorMsg = "Rate limit (429)";
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`[Worker] Timeout (60s) alcanzado para modelo ${modelName} con Key ${i + 1}.`);
        lastErrorMsg = "Timeout (60s)";
      } else {
        console.warn(`[Worker] Error de red con Key ${i + 1}:`, error.message);
        lastErrorMsg = error.message || "Network Error";
      }
    }
  }

  // Si todas fallan, lanzar error
  throw new Error(`Todas las API keys fallaron para ${modelName}. Razón: ${lastErrorMsg}`);
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

      const model = "openrouter/free";
      const dificultadMap: Record<string, string> = {
        facil: "básicos y conceptos fundamentales",
        media: "comprensión, aplicación y análisis de conceptos",
        dificil: "análisis profundo, síntesis y pensamiento crítico a nivel universitario",
      };

      // OPTIMIZACIÓN: Reducción a 8000 para mayor foco y velocidad por fragmento
      const chunks = splitText(temario, 8000);
      let allQuestions: ExamQuestion[] = [];
      let lastError = "";

      const totalChunks = chunks.length;
      const baseQuestions = Math.floor(numeroPreguntas / totalChunks);
      const remainder = numeroPreguntas % totalChunks;

      const chunkPromises = chunks.map(async (chunkContent, i) => {
        const questionsForThisChunk = baseQuestions + (i < remainder ? 1 : 0);
        if (questionsForThisChunk <= 0) return [];

        // Pequeño retardo escalonado (500ms) para no saturar
        await wait(i * 500);

        const systemPrompt = `Eres un profesor universitario experto en evaluación. Tu objetivo es generar preguntas de opción múltiple impecables estrictamente basadas en el temario proporcionado. No eres un asistente, eres un evaluador estricto.

<reglas_inquebrantables>
1. IDIOMA: Todo, absolutamente todo, debe estar en ESPAÑOL. Traduce conceptos si están en inglés.
2. CERO META-LENGUAJE: Trata la información como conocimiento universal. NUNCA uses frases como "según el texto", "en este fragmento", "el autor indica", ni menciones documentos. No hagas referencia a que la información proviene de un texto.
3. SOLO INFORMACIÓN PROPORCIONADA: Evalúa exclusivamente la información del <fragmento_temario>. Está TERMINANTEMENTE PROHIBIDO inventar datos, usar conocimientos externos o generar preguntas sobre temas que no aparezcan en el fragmento (ej. no inventes probabilidades o situaciones hipotéticas si el texto es de literatura).
4. ENFOQUE EVALUATIVO: Evita preguntas triviales de definiciones. Pregunta por características, funcionamientos o consecuencias.
5. HOMOGENEIDAD DE OPCIONES (CRÍTICO): Todas las opciones (correcta e incorrectas) DEBEN tener una LONGITUD, estructura gramatical y nivel de detalle MUY SIMILAR. Es vital que el alumno no pueda adivinar la respuesta correcta por destacarse en tamaño.
6. FORMATO DE OPCIONES: No incluyes jamás prefijos como "A)", "B)", "1." al inicio de las opciones.
7. FORMATO JSON: La salida debe ser estrictamente un objeto JSON con un array "questions", donde cada pregunta tiene "id", "question", "choices" (array de textos), "answerIndex" (número base 0) y "explanation" (explicación directa sin referencias al texto).
</reglas_inquebrantables>

<ejemplo_formato_perfecto>
{
  "questions": [
    {
      "id": 1,
      "question": "¿Qué característica define el inicio funcional del Neolítico?",
      "choices": [
        "El asentamiento poblacional y organización orientada hacia la práctica de la agricultura inicial.",
        "El desarrollo tecnológico de armamento punzante orientado fundamentalmente hacia fines cinegéticos.",
        "La fragmentación social acelerada dependiente del control de incipientes rutas de tránsito marítimo.",
        "La rápida adopción de herramientas metalúrgicas dedicadas fundamentalmente al comercio de excedentes."
      ],
      "answerIndex": 0,
      "explanation": "El Neolítico se define por la transición a una economía de producción enfocada sobre todo en las prácticas agrícolas continuas."
    }
  ]
}
</ejemplo_formato_perfecto>

Genera exactamente ${questionsForThisChunk} preguntas con ${numeroRespuestas || 4} opciones cada una. Devuelve ÚNICAMENTE el objeto JSON.`;

        const examSeed = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const userPrompt = `[Sesión única: ${examSeed}] Genera ${questionsForThisChunk} preguntas completamente nuevas y variadas para el curso ${curso} (nivel: ${dificultadMap[dificultad] || "medio"}). No repitas estilos de generaciones anteriores.

<fragmento_temario>
${chunkContent}
</fragmento_temario>

RECORDATORIO: Devuelve SOLO el código JSON estructurado. Aplica fielmente las reglas de longitud idéntica para todas las opciones, cero meta-lenguaje y sin prefijos en las opciones.`;

        let attempts = 0;
        let success = false;
        let chunkQuestions: ExamQuestion[] = [];

        while (attempts < 3 && !success) {
          try {
            if (attempts > 0) await wait(1000 * attempts + Math.random() * 1000);

            // Estrategia de modelos: Gemini Flash (rapido/estable) -> Nemotron (potente) -> Auto
            const models = [
              "google/gemini-flash-1.5:free",
              "nvidia/nemotron-3-super-120b-a12b:free",
              "openrouter/free"
            ];
            const currentModel = models[Math.min(attempts, models.length - 1)];

            const response = await fetchWithFailover("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "HTTP-Referer": "https://examsphere.app",
                "X-Title": "ExamSphere",
              },
              body: JSON.stringify({
                model: currentModel,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt }
                ],
                temperature: 0.1
              })
            }, env, currentModel);

            if (!response.ok) {
              const errText = await response.text();
              let errorMsg = `OpenRouter error: ${response.status}`;
              try {
                const errJson = JSON.parse(errText);
                errorMsg = errJson.error?.message || errJson.error || errorMsg;
              } catch (e) { }
              lastError = errorMsg;
              throw new Error(errorMsg);
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
              lastError = "Invalid JSON structure from AI";
              throw new Error("Invalid JSON structure");
            }
          } catch (e: any) {
            console.error(`Attempt ${attempts + 1} failed for chunk ${i}:`, e);
            lastError = e.message || lastError;
            attempts++;
          }
        }
        return chunkQuestions;
      });

      const results = await Promise.all(chunkPromises);
      allQuestions = results.flat();

      if (allQuestions.length === 0) {
        return new Response(JSON.stringify({ error: `IA Error: ${lastError || "No se pudieron generar preguntas."}` }), {
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
