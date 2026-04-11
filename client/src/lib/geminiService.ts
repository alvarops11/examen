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

interface ExamErrorEvent {
  type: "error";
  code?: string;
  message: string;
  userMessage?: string;
  retryable?: boolean;
}

class ExamGenerationError extends Error {
  code?: string;
  retryable: boolean;

  constructor(message: string, code?: string, retryable: boolean = false) {
    super(message);
    this.name = "ExamGenerationError";
    this.code = code;
    this.retryable = retryable;
  }
}

const getBaseUrl = () => {
  const url = import.meta.env.VITE_WORKER_URL || "http://localhost:8787/api/generate";
  return url.endsWith("/api/generate") ? url.replace("/api/generate", "") : url.replace(/\/$/, "");
};

function getDefaultUserMessage(code?: string): string {
  switch (code) {
    case "RATE_LIMIT":
      return "Ahora mismo se están generando demasiados exámenes. Vuelve a intentarlo en un momento.";
    case "EMPTY_CONTENT":
      return "Añade más contenido antes de generar el examen.";
    case "CONTENT_TOO_SHORT":
      return "El contenido parece demasiado breve para crear un examen útil. Añade más apuntes o un fragmento más completo.";
    case "DOCUMENT_PROCESSING_FAILED":
      return "No hemos podido aprovechar bien el contenido del documento. Prueba con otro fragmento o con unos apuntes más claros.";
    default:
      return "No se pudo generar el examen, espera un momento y vuelve a intentarlo, si no funciona contacta con soporte.";
  }
}

/**
 * Registra una visita en el servidor
 */
export async function trackVisit(): Promise<void> {
  const workerUrl = getBaseUrl() + "/api/track-visit";
  try {
    const lastVisit = localStorage.getItem("last_visit");
    const today = new Date().toISOString().split("T")[0];

    if (lastVisit === today) return;

    await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    localStorage.setItem("last_visit", today);
  } catch (error) {
    console.error("Error tracking visit:", error);
  }
}

/**
 * Obtiene las estadísticas del servidor
 */
export async function fetchStats(): Promise<any> {
  const workerUrl = getBaseUrl() + "/api/stats";
  try {
    const response = await fetch(workerUrl);
    if (!response.ok) throw new Error("Error fetching stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
}

/**
 * Registra un evento personalizado en el servidor
 */
export async function trackEvent(event: string): Promise<void> {
  const workerUrl = getBaseUrl() + "/api/track-event";
  try {
    await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}

/**
 * Genera un examen llamando al backend (Cloudflare Worker) usando SSE para logs en tiempo real.
 */
export async function generateExamWithOpenRouter(
  curso: string,
  dificultad: string,
  numeroPreguntas: number,
  numeroRespuestas: number,
  temario: string,
  onProgress?: (message: string) => void
): Promise<ExamResponse> {
  const workerUrl = getBaseUrl() + "/api/generate";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curso, dificultad, numeroPreguntas, numeroRespuestas, temario }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ExamGenerationError(
        errorData.userMessage || errorData.error || getDefaultUserMessage(errorData.code),
        errorData.code,
        errorData.retryable ?? false
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ExamGenerationError(getDefaultUserMessage("NO_RESULT"), "NO_RESULT", true);
    }

    const decoder = new TextDecoder();
    let partialLine = "";
    let finalData: ExamResponse | null = null;

    while (true) {
      const { value, done } = await reader.read();

      const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = (partialLine + chunk).split("\n");
      partialLine = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

        const jsonStr = trimmedLine.replace("data: ", "");
        let event: any;

        try {
          event = JSON.parse(jsonStr);
        } catch (error) {
          console.error("Error al parsear evento SSE:", error, "Line content:", trimmedLine);
          continue;
        }

        if (event.type === "log") {
          if (onProgress) onProgress(event.message);
          console.log(`%c[IA Log] %c${event.message}`, "color: #8b5cf6; font-weight: bold;", "color: #4b5563;");
        } else if (event.type === "error") {
          const errorEvent = event as ExamErrorEvent;
          console.error(`%c[IA Error] %c${errorEvent.message}`, "color: #ef4444; font-weight: bold;", "color: #ef4444;");
          throw new ExamGenerationError(
            errorEvent.userMessage || getDefaultUserMessage(errorEvent.code),
            errorEvent.code,
            errorEvent.retryable ?? false
          );
        } else if (event.type === "result") {
          finalData = event.data;
          console.log("%c[IA Success] %cExamen generado completamente", "color: #10b981; font-weight: bold;", "color: #10b981;");
        }
      }

      if (done) break;
    }

    if (partialLine.trim().startsWith("data: ")) {
      const jsonStr = partialLine.trim().replace("data: ", "");
      try {
        const event = JSON.parse(jsonStr);
        if (event.type === "result") finalData = event.data;
        if (event.type === "error") {
          const errorEvent = event as ExamErrorEvent;
          throw new ExamGenerationError(
            errorEvent.userMessage || getDefaultUserMessage(errorEvent.code),
            errorEvent.code,
            errorEvent.retryable ?? false
          );
        }
      } catch (error) {
        if (error instanceof ExamGenerationError) throw error;
        console.error("Error al parsear línea final SSE:", error);
      }
    }

    if (!finalData) {
      throw new ExamGenerationError(getDefaultUserMessage("NO_RESULT"), "NO_RESULT", true);
    }

    return finalData;
  } catch (error) {
    console.error("Error generating exam:", error);
    throw error;
  }
}
