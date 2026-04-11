
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

type ErrorCode =
  | "RATE_LIMIT"
  | "EMPTY_CONTENT"
  | "CONTENT_TOO_SHORT"
  | "DOCUMENT_PROCESSING_FAILED"
  | "UPSTREAM_UNAVAILABLE"
  | "SERVER_MISCONFIG"
  | "NO_QUESTIONS_GENERATED"
  | "UNKNOWN";

class WorkerAppError extends Error {
  code: ErrorCode;
  userMessage: string;
  retryable: boolean;

  constructor(code: ErrorCode, message: string, userMessage: string, retryable: boolean = false) {
    super(message);
    this.name = "WorkerAppError";
    this.code = code;
    this.userMessage = userMessage;
    this.retryable = retryable;
  }
}

function toErrorEvent(error: unknown) {
  if (error instanceof WorkerAppError) {
    return {
      type: "error",
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      retryable: error.retryable,
    };
  }

  return {
    type: "error",
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Unknown error",
    userMessage: "No se pudo generar el examen, espera un momento y vuelve a intentarlo, si no funciona contacta con soporte.",
    retryable: true,
  };
}

// Helper para dividir el texto en chunks sin cortar párrafos
function splitOversizedBlock(block: string, maxChunkSize: number): string[] {
  const normalized = block.trim();
  if (!normalized) return [];
  if (normalized.length <= maxChunkSize) return [normalized];

  const parts: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + maxChunkSize, normalized.length);

    if (end < normalized.length) {
      const breakCandidates = [
        normalized.lastIndexOf("\n", end),
        normalized.lastIndexOf(". ", end),
        normalized.lastIndexOf("; ", end),
        normalized.lastIndexOf(", ", end),
        normalized.lastIndexOf(" ", end),
      ];
      const breakpoint = breakCandidates.find((index) => index > start + Math.floor(maxChunkSize * 0.6));
      if (breakpoint !== undefined && breakpoint > start) {
        end = breakpoint + 1;
      }
    }

    parts.push(normalized.slice(start, end).trim());
    start = end;
  }

  return parts.filter(Boolean);
}

function splitText(text: string, maxChunkSize = 8000): string[] {
  if (text.length <= maxChunkSize) return [text];

  const chunks: string[] = [];
  let currentChunk = "";
  // Dividir por párrafos dobles o saltos de línea para conservar contexto
  const paragraphs = text
    .split(/\n\n+/)
    .flatMap((paragraph) => splitOversizedBlock(paragraph, maxChunkSize))
    .filter(Boolean);

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

function selectRepresentativeChunks(chunks: string[], maxChunks: number): string[] {
  if (chunks.length <= maxChunks) return chunks;

  const selected: string[] = [];
  const step = (chunks.length - 1) / (maxChunks - 1);

  for (let i = 0; i < maxChunks; i++) {
    const index = Math.round(i * step);
    selected.push(chunks[index]);
  }

  return selected;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runChunkTasksWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextTaskIndex = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = nextTaskIndex++;
      if (currentIndex >= tasks.length) return;
      results[currentIndex] = await tasks[currentIndex]();
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  );

  return results;
}

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
  let lastStatus: number | null = null;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    for (let retry = 0; retry < 2; retry++) {
      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${apiKey}`);

      console.log(`[Worker] Intentando modelo ${modelName} con API Key ${i + 1}/${keys.length} (retry ${retry + 1}/2)...`);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.ok || (response.status >= 400 && response.status < 500 && ![401, 403, 429].includes(response.status))) {
          if (response.ok) console.log(`[Worker] Éxito con modelo ${modelName} y Key ${i + 1}.`);
          return response;
        }

        console.warn(`[Worker] API Key ${i + 1} falló con status ${response.status}.`);
        lastErrorMsg = `HTTP ${response.status} ${response.statusText}`;
        lastStatus = response.status;
        if (response.status === 429) {
          lastErrorMsg = "Rate limit (429)";
          if (retry < 1) {
            await wait(1200 * (retry + 1) + Math.random() * 800);
            continue;
          }
        }
      } catch (error: any) {
        console.warn(`[Worker] Error de red con Key ${i + 1}:`, error.message);
        lastErrorMsg = error.message || "Network Error";
        if (retry < 1) {
          await wait(1200 * (retry + 1) + Math.random() * 800);
          continue;
        }
      }

      break;
    }
  }

  if (lastStatus === 429 || lastErrorMsg.includes("Rate limit")) {
    throw new WorkerAppError(
      "RATE_LIMIT",
      `Todas las API keys fallaron para ${modelName}. Razón: ${lastErrorMsg}`,
      "Ahora mismo se están generando demasiados exámenes. Vuelve a intentarlo en un momento.",
      true
    );
  }

  throw new WorkerAppError(
    "UPSTREAM_UNAVAILABLE",
    `Todas las API keys fallaron para ${modelName}. Razón: ${lastErrorMsg}`,
    "No se pudo generar el examen, espera un momento y vuelve a intentarlo, si no funciona contacta con soporte.",
    true
  );
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

    const startTime = Date.now();
    const encoder = new TextEncoder();

    // Creamos la respuesta en streaming (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        const sendSSE = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          if (!env.OPENROUTER_API_KEY) {
            const availableKeys = Object.keys(env).join(", ");
            console.error(`[Worker] Missing API Key. Available env keys: ${availableKeys}`);
            sendSSE(toErrorEvent(new WorkerAppError(
              "SERVER_MISCONFIG",
              `Server misconfiguration: Missing API Key. (Available: ${availableKeys})`,
              "No se pudo generar el examen, espera un momento y vuelve a intentarlo, si no funciona contacta con soporte."
            )));
            controller.close();
            return;
          }

          const body = await request.json() as GenerateRequest;
          const { curso, dificultad, numeroPreguntas, numeroRespuestas, temario } = body;

          if (!temario || !temario.trim()) {
            sendSSE(toErrorEvent(new WorkerAppError(
              "EMPTY_CONTENT",
              "Temario requerido",
              "Añade contenido antes de generar el examen."
            )));
            controller.close();
            return;
          }

          if (temario.trim().length < 120) {
            sendSSE(toErrorEvent(new WorkerAppError(
              "CONTENT_TOO_SHORT",
              "Temario demasiado breve",
              "El contenido parece demasiado breve para crear un examen útil. Añade más apuntes o un fragmento más completo."
            )));
            controller.close();
            return;
          }

          const dificultadMap: Record<string, string> = {
            facil: "básicos y conceptos fundamentales",
            media: "comprensión, aplicación y análisis de conceptos",
            dificil: "análisis profundo, síntesis y pensamiento crítico a nivel universitario",
          };

          sendSSE({ type: "log", message: `Preparando tu examen de nivel ${dificultad}...` });

          const allChunks = splitText(temario, 5500);
          const chunks = selectRepresentativeChunks(allChunks, 12);
          const chunkConcurrency = chunks.length >= 8 ? 2 : 3;
          if (allChunks.length > chunks.length) {
            sendSSE({ type: "log", message: `Documento extenso detectado: se ha optimizado el análisis para evitar bloqueos.` });
          }
          sendSSE({ type: "log", message: `Analizando el contenido compartido (${chunks.length} secciones)...` });

          let allQuestions: ExamQuestion[] = [];
          const chunkFailureReasons: string[] = [];

          const totalChunks = chunks.length;
          const baseQuestions = Math.floor(numeroPreguntas / totalChunks);
          const remainder = numeroPreguntas % totalChunks;

          const chunkTasks = chunks.map((chunkContent, i) => async () => {
            const questionsForThisChunk = baseQuestions + (i < remainder ? 1 : 0);
            if (questionsForThisChunk <= 0) return [];

            // Paralelismo total: eliminamos el retraso escalonado
            sendSSE({ type: "log", message: `Extrayendo preguntas de la sección ${i + 1}...` });

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
            const userPrompt = `[Sesión única: ${examSeed}] Genera ${questionsForThisChunk} preguntas para el curso ${curso} (nivel: ${dificultadMap[dificultad] || "medio"}).

<fragmento_temario>
${chunkContent}
</fragmento_temario>

RECORDATORIO: Devuelve SOLO el código JSON estructurado.`;

            let attempts = 0;
            let success = false;
            let chunkQuestions: ExamQuestion[] = [];
            let chunkLastError = "";

            // ESTRATEGIA DE FALLOVER ROBUSTA (V5): Siguiendo la secuencia exacta del usuario
            const models = [
              "stepfun/step-3.5-flash:free",
              "openrouter/free"
            ];

            while (attempts < models.length && !success) {
              try {
                if (attempts > 0) await wait(1000 * attempts + Math.random() * 1000);

                const currentModel = models[attempts];

                // LOG AL NAVEGADOR
                sendSSE({ type: "log", message: `Refinando sección ${i + 1} para mayor calidad...` });

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
                  throw new Error(`OpenRouter error: ${response.status} - ${errText}`);
                }

                const data: any = await response.json();
                let content = data.choices?.[0]?.message?.content || "";
                content = content.replace(/```json/g, "").replace(/```/g, "").trim();

                let parsed: any;
                try {
                  parsed = JSON.parse(content);
                } catch (e) {
                  const jsonMatch = content.match(/\{[\s\S]*\}/);
                  if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
                }

                if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
                  chunkQuestions = parsed.questions.map((q: any) => {
                    const choices = [...q.choices];
                    const correctChoice = choices[q.answerIndex];
                    for (let j = choices.length - 1; j > 0; j--) {
                      const k = Math.floor(Math.random() * (j + 1));
                      [choices[j], choices[k]] = [choices[k], choices[j]];
                    }
                    return {
                      ...q,
                      choices,
                      answerIndex: choices.indexOf(correctChoice) === -1 ? 0 : choices.indexOf(correctChoice)
                    };
                  });
                  success = true;
                  sendSSE({ type: "log", message: `Sección ${i + 1} lista.` });
                } else {
                  throw new Error("Invalid JSON structure");
                }
              } catch (e: any) {
                chunkLastError = e.message;
                attempts++;
              }
            }
            if (!success) {
              chunkFailureReasons.push(chunkLastError || "Unknown chunk error");
              sendSSE({ type: "log", message: `Aviso: Dificultad en sección ${i + 1}, ajustando parámetros.` });
            }
            return chunkQuestions;
          });

          console.log(`[Worker] Procesando ${chunks.length} fragmentos con concurrencia ${chunkConcurrency}...`);
          const results = await runChunkTasksWithConcurrency(chunkTasks, chunkConcurrency);
          allQuestions = results.flat();
          console.log(`[Worker] Generación completada. Total preguntas: ${allQuestions.length}`);

          if (allQuestions.length === 0) {
            console.error("[Worker] Error: No se generó ninguna pregunta.");
            const failureText = chunkFailureReasons.join(" | ");
            if (failureText.includes("Rate limit")) {
              sendSSE(toErrorEvent(new WorkerAppError(
                "RATE_LIMIT",
                failureText,
                "Ahora mismo se están generando demasiados exámenes. Vuelve a intentarlo en un momento.",
                true
              )));
            } else if (failureText.includes("Invalid JSON structure") || failureText.includes("OpenRouter error")) {
              sendSSE(toErrorEvent(new WorkerAppError(
                "DOCUMENT_PROCESSING_FAILED",
                failureText || "No se pudieron generar preguntas válidas.",
                "No hemos podido aprovechar bien el contenido del documento. Prueba con otro fragmento o con unos apuntes más claros.",
                true
              )));
            } else {
              sendSSE(toErrorEvent(new WorkerAppError(
                "NO_QUESTIONS_GENERATED",
                failureText || "No se pudieron generar preguntas.",
                "No se pudo generar el examen, espera un momento y vuelve a intentarlo, si no funciona contacta con soporte.",
                true
              )));
            }
          } else {
            const finalQuestions = allQuestions.map((q, index) => ({ ...q, id: index + 1 }));
            const responseData: ExamResponse = {
              title: `Examen - ${curso}`,
              difficulty: dificultad,
              questions: finalQuestions
            };

            // Enviar resultado final
            console.log("[Worker] Enviando resultado final al cliente...");
            sendSSE({ type: "result", data: responseData });

            // Track metrics
            const duration = Date.now() - startTime;
            ctx.waitUntil((async () => {
              await incrementStatDaily(env.STATS_KV, 'e');
              await incrementStat(env.STATS_KV, `diff:${dificultad}`);
              await incrementStat(env.STATS_KV, `course:${curso}`);
              await incrementStat(env.STATS_KV, `stats:total_questions`, allQuestions.length);
              await incrementStat(env.STATS_KV, `stats:total_gen_time`, duration);
            })());
          }
        } catch (error: any) {
          sendSSE(toErrorEvent(error));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        ...corsHeaders()
      },
    });
  },
};
