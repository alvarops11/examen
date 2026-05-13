
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
  visitorType?: "new" | "returning";
  visitorId?: string;
}

interface TutorRequest {
  question: ExamQuestion;
  userMessage: string;
  userAnswerIndex?: number | null;
  visitorType?: "new" | "returning";
  visitorId?: string;
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

// Helper para dividir el texto en chunks sin cortar pÃ¡rrafos
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
  // Dividir por pÃ¡rrafos dobles o saltos de lÃ­nea para conservar contexto
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

function selectCompactChunks(chunks: string[], requestedQuestions: number): string[] {
  if (chunks.length === 0) return [];

  const targetChunkCount = Math.max(
    3,
    Math.min(6, requestedQuestions, Math.ceil(requestedQuestions / 4))
  );

  return selectRepresentativeChunks(chunks, Math.min(targetChunkCount, chunks.length));
}

function distributeQuestionCounts(totalQuestions: number, totalChunks: number): number[] {
  if (totalChunks <= 0) return [];

  const baseQuestions = Math.floor(totalQuestions / totalChunks);
  const remainder = totalQuestions % totalChunks;

  return Array.from({ length: totalChunks }, (_, index) => (
    baseQuestions + (index < remainder ? 1 : 0)
  ));
}

function sanitizeQuestion(rawQuestion: any, expectedChoices: number): ExamQuestion | null {
  const question = typeof rawQuestion?.question === "string" ? rawQuestion.question.trim() : "";
  const explanation = typeof rawQuestion?.explanation === "string" ? rawQuestion.explanation.trim() : "";
  const rawChoices = Array.isArray(rawQuestion?.choices) ? rawQuestion.choices : [];
  const choices = rawChoices
    .filter((choice: unknown) => typeof choice === "string")
    .map((choice: string) => choice.trim())
    .filter(Boolean);
  const answerIndex = Number.isInteger(rawQuestion?.answerIndex) ? rawQuestion.answerIndex : -1;

  if (!question || !explanation) return null;
  if (choices.length !== expectedChoices) return null;
  if (answerIndex < 0 || answerIndex >= choices.length) return null;

  const correctChoice = choices[answerIndex];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return {
    id: 0,
    question,
    choices,
    answerIndex: choices.indexOf(correctChoice),
    explanation,
  };
}

function sanitizeQuestions(rawQuestions: any[], expectedChoices: number): ExamQuestion[] {
  return rawQuestions
    .map((question) => sanitizeQuestion(question, expectedChoices))
    .filter((question): question is ExamQuestion => question !== null);
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
  modelName: string,
  keyRotationOffset: number = 0
): Promise<Response> {
  const keys = [env.OPENROUTER_API_KEY];
  if (env.OPENROUTER_API_KEY_BACKUP_1) keys.push(env.OPENROUTER_API_KEY_BACKUP_1);
  if (env.OPENROUTER_API_KEY_BACKUP_2) keys.push(env.OPENROUTER_API_KEY_BACKUP_2);
  if (env.OPENROUTER_API_KEY_BACKUP_3) keys.push(env.OPENROUTER_API_KEY_BACKUP_3);
  const orderedKeys = keys.map((_, index) => keys[(index + keyRotationOffset) % keys.length]);

  let lastErrorMsg = "Servicio no disponible temporalmente.";
  let lastStatus: number | null = null;
  let sawRateLimit = false;
  let sawOtherFailure = false;

  for (let i = 0; i < orderedKeys.length; i++) {
    const apiKey = orderedKeys[i];
    for (let retry = 0; retry < 2; retry++) {
      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${apiKey}`);

      console.log(`[Worker] Intentando modelo ${modelName} con API Key ${i + 1}/${orderedKeys.length} (retry ${retry + 1}/2, offset ${keyRotationOffset})...`);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.ok || (response.status >= 400 && response.status < 500 && ![401, 403, 429].includes(response.status))) {
          if (response.ok) console.log(`[Worker] Ã‰xito con modelo ${modelName} y Key ${i + 1}.`);
          return response;
        }

        console.warn(`[Worker] API Key ${i + 1} fallÃ³ con status ${response.status}.`);
        lastErrorMsg = `HTTP ${response.status} ${response.statusText}`;
        lastStatus = response.status;
        if (response.status === 429) {
          sawRateLimit = true;
          lastErrorMsg = "Rate limit (429)";
          if (retry < 1) {
            await wait(1200 * (retry + 1) + Math.random() * 800);
            continue;
          }
        } else {
          sawOtherFailure = true;
        }
      } catch (error: any) {
        console.warn(`[Worker] Error de red con Key ${i + 1}:`, error.message);
        lastErrorMsg = error.message || "Network Error";
        sawOtherFailure = true;
        if (retry < 1) {
          await wait(1200 * (retry + 1) + Math.random() * 800);
          continue;
        }
      }

      break;
    }
  }

  if ((lastStatus === 429 || lastErrorMsg.includes("Rate limit")) && sawRateLimit && !sawOtherFailure) {
    throw new WorkerAppError(
      "RATE_LIMIT",
      `Todas las API keys fallaron para ${modelName}. RazÃ³n: ${lastErrorMsg}`,
      "Ahora mismo se estÃ¡n generando demasiados exÃ¡menes. Vuelve a intentarlo en un momento.",
      true
    );
  }

  throw new WorkerAppError(
    "UPSTREAM_UNAVAILABLE",
    `Todas las API keys fallaron para ${modelName}. RazÃ³n: ${lastErrorMsg}`,
    "No se pudo generar el examen, espera un momento y vuelve a intentarlo, si no funciona contacta con soporte.",
    true
  );
}

export function normalizeTutorAnswer(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[*-]\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function generateTutorAnswer(
  body: TutorRequest,
  env: Env
): Promise<string> {
  const { question, userMessage, userAnswerIndex } = body;

  if (!question?.question || !Array.isArray(question?.choices) || typeof userMessage !== "string" || !userMessage.trim()) {
    throw new WorkerAppError(
      "DOCUMENT_PROCESSING_FAILED",
      "Tutor request incompleta",
      "No se pudo abrir el tutor de errores con la información recibida."
    );
  }

  const choicesText = question.choices
    .map((choice, index) => `${String.fromCharCode(65 + index)}. ${choice}`)
    .join("\n");

  const selectedChoice =
    typeof userAnswerIndex === "number" && userAnswerIndex >= 0 && userAnswerIndex < question.choices.length
      ? question.choices[userAnswerIndex]
      : null;

  const systemPrompt = `Eres el Tutor de errores de ExamSphere. Tu trabajo es ayudar al estudiante a entender una pregunta que acaba de corregir.

<reglas>
1. Responde siempre en español claro, natural y directo.
2. Limítate exclusivamente a la pregunta, las opciones y la explicación proporcionadas.
3. No inventes teoría que no se pueda inferir razonablemente del contexto recibido.
4. No des la respuesta en formato brusco o seco: explica con tono de profesor útil.
5. Si el alumno pregunta algo muy amplio o ajeno a la pregunta, redirígelo al concepto concreto evaluado.
6. Tu respuesta debe ser breve pero útil: entre 80 y 220 palabras.
7. Puedes usar viñetas cortas si ayudan, pero no conviertas la respuesta en algo excesivamente largo.
8. No uses markdown, ni negritas, ni encabezados, ni asteriscos decorativos.
</reglas>`;

  const userPrompt = `Pregunta:
${question.question}

Opciones:
${choicesText}

Respuesta correcta:
${question.choices[question.answerIndex]}

${selectedChoice ? `Respuesta del alumno:\n${selectedChoice}\n` : ""}
Explicación base:
${question.explanation}

Duda del alumno:
${userMessage.trim()}

Ayuda al alumno a entender mejor esta pregunta y su error si lo hubo.`;

  const models = [
    "openrouter/free",
  ];

  let lastError = "No se pudo obtener respuesta del tutor.";

  for (let attempt = 0; attempt < models.length; attempt++) {
    const model = models[attempt];
    try {
      const response = await fetchWithFailover(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "HTTP-Referer": "https://examsphere.app",
            "X-Title": "ExamSphere",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
          }),
        },
        env,
        model,
        attempt
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter error: ${response.status} - ${errText}`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (content) {
        return normalizeTutorAnswer(content);
      }

      throw new Error("Respuesta vacía del tutor");
    } catch (error: any) {
      lastError = error.message || lastError;
    }
  }

  throw new WorkerAppError(
    "UPSTREAM_UNAVAILABLE",
    lastError,
    "No se pudo consultar al tutor ahora mismo. Inténtalo de nuevo en un momento.",
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
        audience: {
          unique_total: parseInt(await env.STATS_KV.get(`vn:new:all`) || "0"),
          new: {
            today: parseInt(await env.STATS_KV.get(`vn:new:${today}`) || "0"),
            month: parseInt(await env.STATS_KV.get(`vn:new:${thisMonth}`) || "0"),
            total: parseInt(await env.STATS_KV.get(`vn:new:all`) || "0"),
          },
          returning: {
            today: parseInt(await env.STATS_KV.get(`vn:returning:${today}`) || "0"),
            month: parseInt(await env.STATS_KV.get(`vn:returning:${thisMonth}`) || "0"),
            total: parseInt(await env.STATS_KV.get(`vn:returning:all`) || "0"),
          },
        },
        exams: {
          today: parseInt(await env.STATS_KV.get(`e:${today}`) || "0"),
          month: parseInt(await env.STATS_KV.get(`e:${thisMonth}`) || "0"),
          total: parseInt(await env.STATS_KV.get(`e:all`) || "0"),
        },
        examSegments: {
          new: {
            today: parseInt(await env.STATS_KV.get(`es:new:${today}`) || "0"),
            month: parseInt(await env.STATS_KV.get(`es:new:${thisMonth}`) || "0"),
            total: parseInt(await env.STATS_KV.get(`es:new:all`) || "0"),
          },
          returning: {
            today: parseInt(await env.STATS_KV.get(`es:returning:${today}`) || "0"),
            month: parseInt(await env.STATS_KV.get(`es:returning:${thisMonth}`) || "0"),
            total: parseInt(await env.STATS_KV.get(`es:returning:all`) || "0"),
          },
        },
        difficulties: {
          facil: parseInt(await env.STATS_KV.get(`diff:facil`) || "0"),
          media: parseInt(await env.STATS_KV.get(`diff:media`) || "0"),
          dificil: parseInt(await env.STATS_KV.get(`diff:dificil`) || "0"),
        },
        courses: {
          "1Âº": parseInt(await env.STATS_KV.get(`course:1Âº`) || "0"),
          "2Âº": parseInt(await env.STATS_KV.get(`course:2Âº`) || "0"),
          "3Âº": parseInt(await env.STATS_KV.get(`course:3Âº`) || "0"),
          "4Âº": parseInt(await env.STATS_KV.get(`course:4Âº`) || "0"),
          "MÃ¡ster": parseInt(await env.STATS_KV.get(`course:MÃ¡ster`) || "0"),
        },
        technical: {
          total_questions: parseInt(await env.STATS_KV.get(`stats:total_questions`) || "0"),
          total_gen_time: parseInt(await env.STATS_KV.get(`stats:total_gen_time`) || "0"),
        },
        events: {
          pdf_normal: parseInt(await env.STATS_KV.get(`event:pdf_normal`) || "0"),
          pdf_corrected: parseInt(await env.STATS_KV.get(`event:pdf_corrected`) || "0"),
          exam_rating: parseInt(await env.STATS_KV.get(`event:exam_rating`) || "0"),
        },
        feedback: {
          total_votes: parseInt(await env.STATS_KV.get(`rating:count`) || "0"),
          average_rating: parseFloat(await env.STATS_KV.get(`rating:avg`) || "0"),
          ratings: {
            1: parseInt(await env.STATS_KV.get(`rating:value:1`) || "0"),
            2: parseInt(await env.STATS_KV.get(`rating:value:2`) || "0"),
            3: parseInt(await env.STATS_KV.get(`rating:value:3`) || "0"),
            4: parseInt(await env.STATS_KV.get(`rating:value:4`) || "0"),
            5: parseInt(await env.STATS_KV.get(`rating:value:5`) || "0"),
          }
        },
        tutor: {
          opens: parseInt(await env.STATS_KV.get(`event:error_tutor_opened`) || "0"),
          messages: parseInt(await env.STATS_KV.get(`event:error_tutor_message_sent`) || "0"),
          limit_reached: parseInt(await env.STATS_KV.get(`event:error_tutor_limit_reached`) || "0"),
          unique_users: parseInt(await env.STATS_KV.get(`unique:error_tutor_users`) || "0"),
          unique_message_users: parseInt(await env.STATS_KV.get(`unique:error_tutor_message_users`) || "0"),
          feedback: {
            yes: parseInt(await env.STATS_KV.get(`event:error_tutor_trial_feedback_yes`) || "0"),
            no: parseInt(await env.STATS_KV.get(`event:error_tutor_trial_feedback_no`) || "0"),
          },
        }
      };

      return new Response(JSON.stringify(stats), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    // Track Visit Endpoint (POST /api/track-visit)
    if (url.pathname === "/api/track-visit" && request.method === "POST") {
      const { visitorType } = await request.json().catch(() => ({ visitorType: undefined })) as {
        visitorType?: "new" | "returning";
      };

      ctx.waitUntil((async () => {
        await incrementStatDaily(env.STATS_KV, 'v');
        if (visitorType === "new" || visitorType === "returning") {
          await incrementStatDaily(env.STATS_KV, `vn:${visitorType}`);
        }
      })());
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    // Track Event Endpoint (POST /api/track-event)
    if (url.pathname === "/api/track-event" && request.method === "POST") {
      const { event, visitorType, visitorId, rating, liked } = await request.json() as {
        event: string;
        visitorType?: "new" | "returning";
        visitorId?: string;
        rating?: number;
        liked?: boolean;
      };
      if (event) {
        ctx.waitUntil((async () => {
          await incrementStat(env.STATS_KV, `event:${event}`);
          if (visitorType === "new" || visitorType === "returning") {
            await incrementStat(env.STATS_KV, `event:${event}:${visitorType}`);
          }
          if (event.startsWith("error_tutor") && visitorId) {
            const tutorUserKey = `unique:error_tutor_users:${visitorId}`;
            const tutorUserSeen = await env.STATS_KV.get(tutorUserKey);
            if (!tutorUserSeen) {
              await env.STATS_KV.put(tutorUserKey, "1");
              await incrementStat(env.STATS_KV, `unique:error_tutor_users`);
            }
          }
          if (event === "error_tutor_message_sent" && visitorId) {
            const messageUserKey = `unique:error_tutor_message_users:${visitorId}`;
            const messageUserSeen = await env.STATS_KV.get(messageUserKey);
            if (!messageUserSeen) {
              await env.STATS_KV.put(messageUserKey, "1");
              await incrementStat(env.STATS_KV, `unique:error_tutor_message_users`);
            }
          }
          if (event === "exam_rating" && Number.isInteger(rating) && rating! >= 1 && rating! <= 5) {
            await incrementStat(env.STATS_KV, `rating:value:${rating}`);
            const currentCount = parseInt(await env.STATS_KV.get(`rating:count`) || "0");
            const currentSum = parseInt(await env.STATS_KV.get(`rating:sum`) || "0");
            const nextCount = currentCount + 1;
            const nextSum = currentSum + rating!;
            await env.STATS_KV.put(`rating:count`, nextCount.toString());
            await env.STATS_KV.put(`rating:sum`, nextSum.toString());
            await env.STATS_KV.put(`rating:avg`, (nextSum / nextCount).toFixed(2));
          }
          if (event === "error_tutor_trial_feedback" && typeof liked === "boolean") {
            await incrementStat(env.STATS_KV, liked ? `event:error_tutor_trial_feedback_yes` : `event:error_tutor_trial_feedback_no`);
          }
        })());
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    // Tutor de errores (POST /api/tutor-error)
    if (url.pathname === "/api/tutor-error" && request.method === "POST") {
      try {
        if (!env.OPENROUTER_API_KEY) {
          throw new WorkerAppError(
            "SERVER_MISCONFIG",
            "Missing API Key for tutor",
            "No se pudo consultar al tutor ahora mismo."
          );
        }

        const body = await request.json() as TutorRequest;
        const answer = await generateTutorAnswer(body, env);

        return new Response(JSON.stringify({ answer }), {
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      } catch (error) {
        const errorEvent = toErrorEvent(error);
        return new Response(JSON.stringify(errorEvent), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        });
      }
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
          const { curso, dificultad, numeroPreguntas, numeroRespuestas, temario, visitorType } = body;

          if (!temario || !temario.trim()) {
            sendSSE(toErrorEvent(new WorkerAppError(
              "EMPTY_CONTENT",
              "Temario requerido",
              "AÃ±ade contenido antes de generar el examen."
            )));
            controller.close();
            return;
          }

          if (temario.trim().length < 120) {
            sendSSE(toErrorEvent(new WorkerAppError(
              "CONTENT_TOO_SHORT",
              "Temario demasiado breve",
              "El contenido parece demasiado breve para crear un examen Ãºtil. AÃ±ade mÃ¡s apuntes o un fragmento mÃ¡s completo."
            )));
            controller.close();
            return;
          }

          const dificultadMap: Record<string, string> = {
            facil: "bÃ¡sicos y conceptos fundamentales",
            media: "comprensiÃ³n, aplicaciÃ³n y anÃ¡lisis de conceptos",
            dificil: "anÃ¡lisis profundo, sÃ­ntesis y pensamiento crÃ­tico a nivel universitario",
          };

          sendSSE({ type: "log", message: `Preparando tu examen de nivel ${dificultad}...` });

          const allChunks = splitText(temario, 5500);
          const useCompactMode = allChunks.length >= 18;
          const chunks = useCompactMode
            ? selectCompactChunks(allChunks, numeroPreguntas)
            : selectRepresentativeChunks(allChunks, 12);
          const chunkConcurrency = useCompactMode ? 2 : (chunks.length >= 8 ? 2 : 3);
          if (useCompactMode) {
            sendSSE({ type: "log", message: `Documento extenso detectado: se ha optimizado el anÃ¡lisis para evitar bloqueos.` });
          }
          sendSSE({ type: "log", message: `Analizando el contenido compartido (${chunks.length} secciones)...` });

          let allQuestions: ExamQuestion[] = [];
          const chunkFailureReasons: string[] = [];

          const initialDistribution = distributeQuestionCounts(numeroPreguntas, chunks.length);

          const generateQuestionsForChunk = async (
            chunkContent: string,
            questionsForThisChunk: number,
            sectionLabel: string,
            rotationOffset: number
          ): Promise<ExamQuestion[]> => {
            if (questionsForThisChunk <= 0) return [];

            sendSSE({ type: "log", message: `Extrayendo preguntas de la ${sectionLabel}...` });

            const systemPrompt = `Eres un profesor universitario experto en evaluación. Tu objetivo es generar preguntas de opción múltiple estrictamente basadas en el temario proporcionado. Actúas como un evaluador riguroso y preciso.

<reglas_inquebrantables>
1. TODO el contenido debe estar exclusivamente en ESPAÑOL. Traduce términos extranjeros siempre que sea posible.

2. NUNCA hagas referencia al texto, documento o fragmento original. Está prohibido usar expresiones como "según el texto", "el autor indica" o similares.

3. Utiliza ÚNICAMENTE información presente en <fragmento_temario>. No inventes datos, ejemplos ni conocimientos externos.

4. Prioriza preguntas sobre relaciones, características, funciones, diferencias, implicaciones o consecuencias. Usa definiciones directas solo cuando el contenido no permita otro enfoque.

5. Todas las opciones deben tener una longitud, estructura y nivel de detalle similares.

6. Las opciones incorrectas deben ser plausibles y coherentes con el tema. Evita distractores absurdos o claramente falsos.

7. Cada opción debe expresar una idea claramente distinta. Evita respuestas redundantes o equivalentes.

8. No incluyas prefijos como "A)", "B)" o números en las opciones.

9. La salida debe ser JSON válido parseable con JSON.parse(). No añadas markdown, comentarios ni texto fuera del JSON.

10. Si el fragmento no permite generar el número solicitado de preguntas sin inventar contenido, genera menos preguntas antes que introducir información externa.

11. Varía la posición de la respuesta correcta cuando sea posible.
</reglas_inquebrantables>

<formato_json>
{
  "questions": [
    {
      "id": 1,
      "question": "Pregunta",
      "choices": [
        "Opción 1",
        "Opción 2",
        "Opción 3",
        "Opción 4"
      ],
      "answerIndex": 0,
      "explanation": "Explicación breve y directa."
    }
  ]
}
</formato_json>

<directrices_de_calidad>
- Evita reutilizar estructuras idénticas entre preguntas.
- No copies frases completas del temario salvo que sea imprescindible.
- Varía la estructura sintáctica de las preguntas.
- Genera preguntas naturales y específicas según el contenido disponible.
</directrices_de_calidad>

Genera exactamente ${questionsForThisChunk} preguntas con ${numeroRespuestas || 4} opciones cada una.

Devuelve ÚNICAMENTE el objeto JSON.`;

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

            const models = [
              "google/gemma-3-12b-it:free",
              "qwen/qwen3.6-plus:free",
              "openrouter/free"
            ];

            while (attempts < models.length && !success) {
              try {
                if (attempts > 0) await wait(1000 * attempts + Math.random() * 1000);

                const currentModel = models[attempts];
                sendSSE({ type: "log", message: `Refinando la ${sectionLabel} para mayor calidad...` });

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
                }, env, currentModel, rotationOffset + attempts);

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
                  chunkQuestions = sanitizeQuestions(parsed.questions, numeroRespuestas || 4);
                  if (chunkQuestions.length === 0) {
                    throw new Error("Invalid generated questions");
                  }
                  success = true;
                  sendSSE({ type: "log", message: `${sectionLabel.charAt(0).toUpperCase() + sectionLabel.slice(1)} lista.` });
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
              sendSSE({ type: "log", message: `Aviso: Dificultad en la ${sectionLabel}, ajustando parámetros.` });
            }

            return chunkQuestions;
          };

          const chunkTasks = chunks.map((chunkContent, i) => async () => {
            const questionsForThisChunk = initialDistribution[i] || 0;
            return generateQuestionsForChunk(chunkContent, questionsForThisChunk, `sección ${i + 1}`, i);
          });

          console.log(`[Worker] Procesando ${chunks.length} fragmentos con concurrencia ${chunkConcurrency}...`);
          const results = await runChunkTasksWithConcurrency(chunkTasks, chunkConcurrency);
          allQuestions = results.flat();
          if (allQuestions.length < numeroPreguntas && chunks.length > 0) {
            sendSSE({ type: "log", message: `Ajustando el examen para completar las preguntas que faltan...` });

            let refillAttempts = 0;
            let previousQuestionCount = allQuestions.length;

            while (allQuestions.length < numeroPreguntas && refillAttempts < 3) {
              const missingQuestions = numeroPreguntas - allQuestions.length;
              const refillChunks = selectRepresentativeChunks(
                [...chunks].sort((a, b) => b.length - a.length),
                Math.min(chunks.length, Math.max(1, Math.ceil(missingQuestions / 2)))
              );
              const refillDistribution = distributeQuestionCounts(missingQuestions, refillChunks.length);

              const refillTasks = refillChunks.map((chunkContent, i) => async () => (
                generateQuestionsForChunk(
                  chunkContent,
                  refillDistribution[i] || 0,
                  `refuerzo ${refillAttempts + 1}-${i + 1}`,
                  chunks.length + (refillAttempts * refillChunks.length) + i
                )
              ));
              const refillResults = await runChunkTasksWithConcurrency(refillTasks, Math.min(2, refillChunks.length));
              allQuestions = allQuestions.concat(refillResults.flat());

              if (allQuestions.length === previousQuestionCount) {
                break;
              }

              previousQuestionCount = allQuestions.length;
              refillAttempts++;
            }
          }
          if (allQuestions.length > numeroPreguntas) {
            allQuestions = allQuestions.slice(0, numeroPreguntas);
          }
          console.log(`[Worker] GeneraciÃ³n completada. Total preguntas: ${allQuestions.length}`);

          if (allQuestions.length === 0) {
            console.error("[Worker] Error: No se generÃ³ ninguna pregunta.");
            const failureText = chunkFailureReasons.join(" | ");
            if (failureText.includes("Rate limit")) {
              sendSSE(toErrorEvent(new WorkerAppError(
                "RATE_LIMIT",
                failureText,
                "Ahora mismo se estÃ¡n generando demasiados exÃ¡menes. Vuelve a intentarlo en un momento.",
                true
              )));
            } else if (failureText.includes("Invalid JSON structure") || failureText.includes("OpenRouter error")) {
              sendSSE(toErrorEvent(new WorkerAppError(
                "DOCUMENT_PROCESSING_FAILED",
                failureText || "No se pudieron generar preguntas vÃ¡lidas.",
                "No hemos podido aprovechar bien el contenido del documento. Prueba con otro fragmento o con unos apuntes mÃ¡s claros.",
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
            const finalQuestions = allQuestions
              .slice(0, numeroPreguntas)
              .map((q, index) => ({ ...q, id: index + 1 }));
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
              if (visitorType === "new" || visitorType === "returning") {
                await incrementStatDaily(env.STATS_KV, `es:${visitorType}`);
              }
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


