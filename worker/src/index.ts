
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

const EXAM_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "openrouter/free",
];

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
  if (new Set(choices.map((choice) => choice.trim().toLowerCase())).size !== choices.length) return null;

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

function normalizeLineKey(line: string): string {
  return line
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function preprocessTemario(raw: string): { text: string; removedLines: number; originalLines: number } {
  const cleanedRaw = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ");

  const lines = cleanedRaw.split("\n");
  const boilerplatePatterns = [
    /^examsphere$/i,
    /^ai powered learning$/i,
    /^version corregida$/i,
    /^pagina\s+\d+\s+de\s+\d+$/i
  ];

  const repeatedLineCount = new Map<string, number>();
  let lastKeptKey = "";
  let lastWasEmpty = false;
  const kept: string[] = [];
  let removedLines = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (!lastWasEmpty) {
        kept.push("");
        lastWasEmpty = true;
      }
      continue;
    }
    lastWasEmpty = false;

    const key = normalizeLineKey(line);
    if (!key) {
      removedLines++;
      continue;
    }

    if (boilerplatePatterns.some((pattern) => pattern.test(key))) {
      removedLines++;
      continue;
    }

    // Evita ruido por repetición consecutiva exacta (muy común en OCR / slide extraction).
    if (key === lastKeptKey) {
      removedLines++;
      continue;
    }

    const occurrences = (repeatedLineCount.get(key) || 0) + 1;
    repeatedLineCount.set(key, occurrences);

    const tokenCount = key.split(" ").filter(Boolean).length;
    // Conservador: solo limita repeticiones excesivas de líneas cortas.
    if (occurrences > 4 && key.length <= 40 && tokenCount <= 6) {
      removedLines++;
      continue;
    }

    kept.push(line);
    lastKeptKey = key;
  }

  const text = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return {
    text: text.length > 0 ? text : raw.trim(),
    removedLines,
    originalLines: lines.length
  };
}

function sanitizeQuestions(rawQuestions: any[], expectedChoices: number): ExamQuestion[] {
  return rawQuestions
    .map((question) => sanitizeQuestion(question, expectedChoices))
    .filter((question): question is ExamQuestion => question !== null);
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(input: string): Set<string> {
  return new Set(
    normalizeText(input)
      .split(" ")
      .filter((t) => t.length >= 3)
  );
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function looksSpanish(text: string): boolean {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  const commonSpanish = [" el ", " la ", " los ", " las ", " de ", " que ", " en ", " un ", " una ", " y ", " con ", " para ", " por "];
  let hits = 0;
  const padded = ` ${normalized} `;
  for (const marker of commonSpanish) {
    if (padded.includes(marker)) hits++;
  }
  return hits >= 2;
}

function referencesExternalVisualContext(text: string): boolean {
  const normalized = normalizeText(text);
  const bannedPatterns = [
    "tabla mostrada",
    "grafo mostrado",
    "imagen mostrada",
    "figura mostrada",
    "grafico mostrado",
    "diagrama mostrado",
    "como se muestra",
    "segun la tabla",
    "segun el grafico",
    "segun la figura",
    "en la tabla",
    "en el grafico",
    "en la figura",
    "en el diagrama",
    "del ejemplo mostrado",
    "del grafo anterior",
    "de la figura anterior",
    "anterior"
  ];
  return bannedPatterns.some((pattern) => normalized.includes(pattern));
}

function questionQualityGate(question: ExamQuestion): boolean {
  // Reglas duras mínimas: mantener robustez sin bloquear demasiado.
  if (referencesExternalVisualContext(question.question)) return false;
  if (new Set(question.choices.map((choice) => normalizeText(choice))).size !== question.choices.length) return false;
  return true;
}

function dedupeQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  const accepted: ExamQuestion[] = [];
  for (const candidate of questions) {
    const isDuplicate = accepted.some((existing) => (
      normalizeText(existing.question) === normalizeText(candidate.question) ||
      jaccardSimilarity(existing.question, candidate.question) >= 0.9
    ));
    if (!isDuplicate) accepted.push(candidate);
  }
  return accepted;
}

function questionSoftQualityScore(question: ExamQuestion): number {
  let score = 0;
  if (looksSpanish(question.question)) score += 1;
  if (looksSpanish(question.explanation)) score += 1;
  if (question.choices.every((choice) => looksSpanish(choice))) score += 1;
  if (!referencesExternalVisualContext(question.question)) score += 1;
  return score;
}

function computeRequestedQuestionCount(target: number): number {
  const multiplier = target <= 10 ? 1.3 : target <= 20 ? 1.25 : 1.2;
  return Math.max(target, Math.ceil(target * multiplier));
}

function computeMinimumAcceptable(target: number): number {
  return Math.ceil(Math.max(target * 0.85, target - 3));
}

function containsOptionPrefix(text: string): boolean {
  return /^\s*([A-Da-d][\)\.]|\d+[\)\.])\s+/.test(text);
}

function normalizeForLeakDetection(input: string): string {
  return normalizeText(input)
    .replace(/\binfinito\b/g, "∞")
    .replace(/\binfinidad\b/g, "∞");
}

function extractNumbers(input: string): string[] {
  const matches = input.match(/\b\d+(?:[.,]\d+)?\b/g);
  return matches ? matches.map((m) => m.replace(",", ".")) : [];
}

function hasNoPathIntent(question: string): boolean {
  const q = normalizeText(question);
  return (
    q.includes("no hay camino") ||
    q.includes("no existe camino") ||
    q.includes("inalcanzable") ||
    q.includes("componentes conexas diferentes")
  );
}

function hasInfinityChoice(choices: string[]): boolean {
  return choices.some((choice) => {
    const c = normalizeForLeakDetection(choice);
    return c.includes("∞") || c.includes("infinito") || c.includes("infinidad");
  });
}

function computeAnswerLeakage(question: string, choices: string[]): number {
  const normalizedQuestion = normalizeForLeakDetection(question);
  const questionNumbers = new Set(extractNumbers(normalizedQuestion));
  const candidateChoices = choices
    .map((choice) => normalizeForLeakDetection(choice))
    .filter((c) => c.length >= 2);

  const leakedChoices = candidateChoices.filter((choice) => normalizedQuestion.includes(choice));
  let leakage = leakedChoices.length > 0 ? 1 : 0;

  const numericOnlyChoices = candidateChoices.filter((choice) => /^\d+(?:\.\d+)?$/.test(choice));
  if (numericOnlyChoices.length > 0) {
    const numericInQuestion = numericOnlyChoices.filter((c) => questionNumbers.has(c));
    if (numericInQuestion.length === 1) leakage += 2; // fuga numérica fuerte
  }

  return leakage;
}

function isTautologicalPattern(question: string): boolean {
  const q = normalizeText(question);
  const patterns = [
    /si .* (dos|2) .* (cuantos|cantidad)/,
    /si .* (tres|3) .* (cuantos|cantidad)/,
    /la distancia .* es \d+(?:[.,]\d+)? .* cual .* distancia/,
    /si .* (existen|hay) .* caminos .* cuantos/
  ];
  return patterns.some((p) => p.test(q));
}

function getHardRejectionReason(question: ExamQuestion, expectedChoices: number): string | null {
  if (!question.question || !question.explanation) return "empty_fields";
  if (!Array.isArray(question.choices) || question.choices.length !== expectedChoices) return "invalid_choice_count";
  if (question.answerIndex < 0 || question.answerIndex >= question.choices.length) return "invalid_answer_index";
  if (referencesExternalVisualContext(question.question)) return "external_context_dependency";
  if (new Set(question.choices.map((choice) => normalizeText(choice))).size !== question.choices.length) return "duplicate_choices";
  if (question.choices.some((choice) => containsOptionPrefix(choice))) return "dirty_choice_prefix";
  if (hasNoPathIntent(question.question) && !hasInfinityChoice(question.choices)) return "no_path_without_infinity_choice";
  return null;
}

function computeQuestionScore(question: ExamQuestion): number {
  const normalizedQuestion = normalizeText(question.question);
  const choiceLengths = question.choices.map((c) => normalizeText(c).length).filter((len) => len > 0);
  const maxLen = choiceLengths.length > 0 ? Math.max(...choiceLengths) : 0;
  const minLen = choiceLengths.length > 0 ? Math.min(...choiceLengths) : 0;
  const hasTechnicalKeyword = /(kruskal|dijkstra|arbol recubridor|camino mas corto|distancia|grafo|componente conexa)/.test(normalizedQuestion);

  let score = 0;
  if (!referencesExternalVisualContext(question.question)) score += 2;
  if (hasTechnicalKeyword) score += 2;
  if (maxLen > 0 && minLen > 0 && (maxLen / minLen) <= 2.6) score += 1;
  if (normalizedQuestion.length >= 55) score += 1;
  if (referencesExternalVisualContext(question.question)) score -= 3;
  if (question.question.length < 45) score -= 2;
  if (question.choices.some((choice) => /^(si|no|verdadero|falso)$/i.test(choice.trim()))) score -= 2;
  const leakage = computeAnswerLeakage(question.question, question.choices);
  if (leakage >= 2) score -= 5;
  else if (leakage === 1) score -= 3;
  if (isTautologicalPattern(question.question)) score -= 4;
  return score;
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

function modelKey(model: string): string {
  return encodeURIComponent(model);
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
            provider: {
              order: ["Amazon Bedrock", "Weights & Biases"],
              ignore: ["SiliconFlow"],
              allow_fallbacks: true,
            },
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

      const modelStats = await Promise.all(EXAM_MODELS.map(async (model) => {
        const key = modelKey(model);
        const attempts = parseInt(await env.STATS_KV.get(`model:${key}:attempts`) || "0");
        const success = parseInt(await env.STATS_KV.get(`model:${key}:success`) || "0");
        const latencySum = parseInt(await env.STATS_KV.get(`model:${key}:latency_sum`) || "0");
        const timeouts = parseInt(await env.STATS_KV.get(`model:${key}:timeouts`) || "0");
        const fallbackUses = parseInt(await env.STATS_KV.get(`model:${key}:fallback_uses`) || "0");
        const parseFailures = parseInt(await env.STATS_KV.get(`model:${key}:parse_failures`) || "0");
        return {
          model,
          successRate: attempts > 0 ? Number(((success / attempts) * 100).toFixed(1)) : 0,
          avgLatency: attempts > 0 ? Number((latencySum / attempts).toFixed(0)) : 0,
          timeoutRate: attempts > 0 ? Number(((timeouts / attempts) * 100).toFixed(1)) : 0,
          fallbackRate: attempts > 0 ? Number(((fallbackUses / attempts) * 100).toFixed(1)) : 0,
          parseFailureRate: attempts > 0 ? Number(((parseFailures / attempts) * 100).toFixed(1)) : 0,
        };
      }));

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
        },
        modelPerformance: modelStats
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
          const normalizedTemario = preprocessTemario(temario || "");

          if (!temario || !temario.trim()) {
            sendSSE(toErrorEvent(new WorkerAppError(
              "EMPTY_CONTENT",
              "Temario requerido",
              "AÃ±ade contenido antes de generar el examen."
            )));
            controller.close();
            return;
          }

          if (normalizedTemario.text.trim().length < 120) {
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
          if (normalizedTemario.removedLines > 0) {
            sendSSE({
              type: "log",
              message: `Se ha limpiado ruido del temario (${normalizedTemario.removedLines} líneas repetidas o de formato).`
            });
          }

          const targetQuestions = numeroPreguntas;
          const requestedQuestions = computeRequestedQuestionCount(targetQuestions);
          const minimumAcceptable = computeMinimumAcceptable(targetQuestions);

          const allChunks = splitText(normalizedTemario.text, 5500);
          const useCompactMode = allChunks.length >= 18;
          const chunks = useCompactMode
            ? selectCompactChunks(allChunks, requestedQuestions)
            : selectRepresentativeChunks(allChunks, 12);
          const chunkConcurrency = useCompactMode
            ? 3
            : Math.min(4, Math.max(2, chunks.length >= 10 ? 4 : 3));
          if (useCompactMode) {
            sendSSE({ type: "log", message: `Documento extenso detectado: se ha optimizado el anÃ¡lisis para evitar bloqueos.` });
          }
          sendSSE({ type: "log", message: `Objetivo: ${targetQuestions} preguntas. Generación con buffer: ${requestedQuestions}.` });
          sendSSE({ type: "log", message: `Analizando el contenido compartido (${chunks.length} secciones)...` });

          let allQuestions: ExamQuestion[] = [];
          const chunkFailureReasons: string[] = [];
          const discardMetrics: Record<string, number> = {};

          const initialDistribution = distributeQuestionCounts(requestedQuestions, chunks.length);

          const generateQuestionsForChunk = async (
            chunkContent: string,
            questionsForThisChunk: number,
            sectionLabel: string,
            rotationOffset: number
          ): Promise<ExamQuestion[]> => {
            if (questionsForThisChunk <= 0) return [];

            sendSSE({ type: "log", message: `Extrayendo preguntas de la ${sectionLabel}...` });

            const systemPrompt = `Eres un profesor experto en evaluación. Tu objetivo es generar preguntas de opción múltiple de calidad, estrictamente basadas en el temario proporcionado. Actúas como un evaluador riguroso, claro y preciso.

<reglas_inquebrantables>
1. Todo el contenido debe estar exclusivamente en ESPAÑOL.

2. Usa ÚNICAMENTE información presente en <fragmento_temario>. No inventes datos, cifras, nombres, fechas, ejemplos concretos, resultados, casos ni conocimientos externos.

3. Puedes crear mini-casos SOLO si son conceptuales, coherentes con el temario y no introducen datos concretos nuevos no presentes en el fragmento.

4. Cada pregunta debe ser AUTOSUFICIENTE: el alumno debe poder responderla usando únicamente el enunciado visible y sus opciones.

5. Si una pregunta requiere calcular, identificar, comparar o recordar un dato concreto, el enunciado debe incluir todos los datos necesarios para resolverla.

6. Está prohibido referenciar contenido externo al enunciado con expresiones como:
"según el texto", "según el fragmento", "según el documento", "según la tabla", "según la imagen", "según el gráfico", "según el ejemplo", "en el ejemplo", "en el caso anterior", "como se muestra", "como aparece", "en la figura", "en el enunciado", "en el apartado", "en el párrafo".

7. Prohibido crear preguntas cuya respuesta aparezca literalmente en el propio enunciado de forma trivial.

8. Prioriza preguntas sobre relaciones, características, funciones, diferencias, causas, consecuencias, implicaciones, aplicaciones o razonamiento. Usa definiciones directas solo cuando el contenido no permita otro enfoque.

9. Todas las opciones deben tener longitud, estructura y nivel de detalle similares.

10. Las opciones incorrectas deben ser plausibles y coherentes con el tema. Evita distractores absurdos o claramente falsos.

11. Cada opción debe expresar una idea claramente distinta. Evita opciones redundantes, equivalentes o parcialmente duplicadas.

12. Solo debe existir una respuesta correcta clara.

13. Las opciones deben responder exactamente a lo que pregunta el enunciado.

14. No incluyas prefijos como "A)", "B)", números o viñetas dentro de las opciones.

15. La salida debe ser JSON válido parseable con JSON.parse(). No añadas markdown, comentarios ni texto fuera del JSON.

16. Si el fragmento no permite generar el número solicitado de preguntas sin inventar contenido o bajar la calidad, genera menos preguntas.

17. Varía la posición de la respuesta correcta cuando sea posible.
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

<calidad_de_preguntas>
Evita preguntas:
- demasiado obvias o triviales;
- tautológicas;
- cuya respuesta esté contenida literalmente en la pregunta;
- que dependan de una imagen, tabla, gráfico, ejemplo o contexto externo no incluido;
- donde varias opciones puedan considerarse correctas;
- donde ninguna opción responda exactamente a lo preguntado;
- con opciones de longitud o detalle muy descompensados;
- que repitan el mismo concepto con distinta redacción;
- sobre la estructura del documento, índice, capítulos, secciones, subsecciones, apartados o numeración interna del contenido;
- que copien frases largas del temario sin reformularlas.
Evalúa conceptos, relaciones, implicaciones y comprensión del contenido, no la localización del contenido dentro del documento.
</calidad_de_preguntas>

<directrices_de_calidad>
- Genera preguntas naturales, claras y específicas según el contenido disponible.
- Evita reutilizar estructuras idénticas entre preguntas.
- Varía la estructura sintáctica de las preguntas.
- No copies frases completas del temario salvo que sea imprescindible.
- Mantén explicaciones breves, concretas y justificadas.
- Si usas datos concretos, incluye dentro del enunciado todos los datos necesarios para responder sin mirar nada externo.
</directrices_de_calidad>

Genera HASTA ${questionsForThisChunk} preguntas válidas con ${numeroRespuestas || 4} opciones cada una.
Prioriza calidad, autosuficiencia y claridad sobre cantidad.
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

            const models = EXAM_MODELS;

            const maxModelAttempts = models.length; // principal + 2 fallbacks
            while (attempts < maxModelAttempts && !success) {
              try {
                if (attempts > 0) await wait(1000 * attempts + Math.random() * 1000);

                const currentModel = models[attempts];
                const currentModelKey = modelKey(currentModel);
                const modelAttemptStart = Date.now();
                await incrementStat(env.STATS_KV, `model:${currentModelKey}:attempts`);
                if (attempts > 0) {
                  await incrementStat(env.STATS_KV, `model:${currentModelKey}:fallback_uses`);
                }
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
                    temperature: 0.1,
                    provider: {
                      order: ["Amazon Bedrock", "Weights & Biases"],
                      ignore: ["SiliconFlow"],
                      allow_fallbacks: true,
                    },
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
                    await incrementStat(env.STATS_KV, `model:${currentModelKey}:parse_failures`);
                    throw new Error("Invalid generated questions");
                  }
                  await incrementStat(env.STATS_KV, `model:${currentModelKey}:success`);
                  await incrementStat(env.STATS_KV, `model:${currentModelKey}:latency_sum`, Date.now() - modelAttemptStart);
                  success = true;
                  sendSSE({ type: "log", message: `${sectionLabel.charAt(0).toUpperCase() + sectionLabel.slice(1)} lista.` });
                } else {
                  await incrementStat(env.STATS_KV, `model:${currentModelKey}:parse_failures`);
                  throw new Error("Invalid JSON structure");
                }
              } catch (e: any) {
                const currentModel = models[attempts];
                if (currentModel) {
                  const currentModelKey = modelKey(currentModel);
                  if ((e?.message || "").toLowerCase().includes("timeout")) {
                    await incrementStat(env.STATS_KV, `model:${currentModelKey}:timeouts`);
                  }
                }
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
          const rankQuestions = (questions: ExamQuestion[]) => {
            const deduped = dedupeQuestions(questions);
            const accepted: Array<{ q: ExamQuestion; score: number }> = [];

            for (const q of deduped) {
              const hardReason = getHardRejectionReason(q, numeroRespuestas || 4);
              if (hardReason) {
                discardMetrics[hardReason] = (discardMetrics[hardReason] || 0) + 1;
                continue;
              }
              accepted.push({ q, score: computeQuestionScore(q) });
            }

            accepted.sort((a, b) => b.score - a.score);
            return accepted;
          };

          let ranked = rankQuestions(allQuestions);
          let selected = ranked.slice(0, targetQuestions).map((entry) => entry.q);

          const maxRepairRounds = useCompactMode ? 2 : 1;
          let repairRound = 0;
          while (selected.length < targetQuestions && repairRound < maxRepairRounds && chunks.length > 0) {
            const missingQuestions = targetQuestions - selected.length;
            sendSSE({ type: "log", message: `Refuerzo limitado (${repairRound + 1}/${maxRepairRounds}): faltan ${missingQuestions} preguntas.` });

            const refillChunks = selectRepresentativeChunks(
              [...chunks].sort((a, b) => b.length - a.length),
              Math.min(chunks.length, Math.max(1, Math.ceil(missingQuestions / 2)))
            );
            const refillDistribution = distributeQuestionCounts(missingQuestions, refillChunks.length);
            const refillTasks = refillChunks.map((chunkContent, i) => async () => (
              generateQuestionsForChunk(
                chunkContent,
                refillDistribution[i] || 0,
                `refuerzo ${repairRound + 1}-${i + 1}`,
                chunks.length + 200 + (repairRound * refillChunks.length) + i
              )
            ));
            // Repair secuencial para evitar picos de subrequests.
            for (const refillTask of refillTasks) {
              const refillChunkQuestions = await refillTask();
              allQuestions = allQuestions.concat(refillChunkQuestions);
            }
            ranked = rankQuestions(allQuestions);
            selected = ranked.slice(0, targetQuestions).map((entry) => entry.q);
            repairRound++;
          }

          allQuestions = selected;
          console.log(`[Worker] GeneraciÃ³n completada. Total preguntas seleccionadas: ${allQuestions.length}`);
          console.log(`[Worker] Descartes por validación: ${JSON.stringify(discardMetrics)}`);

          if (allQuestions.length < minimumAcceptable) {
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
                failureText || `No se alcanzó el umbral mínimo de calidad (${allQuestions.length}/${targetQuestions}).`,
                `No se pudieron generar suficientes preguntas de calidad con el temario aportado (${allQuestions.length}/${targetQuestions}).`,
                true
              )));
            }
          } else {
            const finalQuestions = allQuestions
              .slice(0, targetQuestions)
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


