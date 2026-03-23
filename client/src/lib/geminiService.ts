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

const getBaseUrl = () => {
  const url = import.meta.env.VITE_WORKER_URL || "http://localhost:8787/api/generate";
  return url.endsWith('/api/generate') ? url.replace('/api/generate', '') : url.replace(/\/$/, '');
};

/**
 * Registra una visita en el servidor
 */
export async function trackVisit(): Promise<void> {
  const WORKER_URL = getBaseUrl() + "/api/track-visit";
  try {
    const lastVisit = localStorage.getItem("last_visit");
    const today = new Date().toISOString().split('T')[0];

    // Solo registrar una visita por día por usuario (básico)
    if (lastVisit === today) return;

    await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
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
  const WORKER_URL = getBaseUrl() + "/api/stats";
  try {
    const response = await fetch(WORKER_URL);
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
  const WORKER_URL = getBaseUrl() + "/api/track-event";
  try {
    await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event })
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

  const WORKER_URL = getBaseUrl() + "/api/generate";

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curso, dificultad, numeroPreguntas, numeroRespuestas, temario })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error del servidor: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No se pudo inicializar el lector de flujo.");

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
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith("data: ")) {
          try {
            const jsonStr = trimmedLine.replace("data: ", "");
            const event = JSON.parse(jsonStr);

            if (event.type === "log") {
              if (onProgress) onProgress(event.message);
              console.log(`%c[IA Log] %c${event.message}`, "color: #8b5cf6; font-weight: bold;", "color: #4b5563;");
            } else if (event.type === "error") {
              console.error(`%c[IA Error] %c${event.message}`, "color: #ef4444; font-weight: bold;", "color: #ef4444;");
              throw new Error(event.message);
            } else if (event.type === "result") {
              finalData = event.data;
              console.log("%c[IA Success] %cExamen generado completamente", "color: #10b981; font-weight: bold;", "color: #10b981;");
            }
          } catch (e) {
            console.error("Error al parsear evento SSE:", e, "Line content:", trimmedLine);
          }
        }
      }

      if (done) break;
    }

    // Procesar cualquier dato restante en partialLine
    if (partialLine.trim().startsWith("data: ")) {
      try {
        const jsonStr = partialLine.trim().replace("data: ", "");
        const event = JSON.parse(jsonStr);
        if (event.type === "result") finalData = event.data;
      } catch (e) {
        console.error("Error al parsear línea final SSE:", e);
      }
    }

    if (!finalData) throw new Error("No se recibió el resultado final del examen.");
    return finalData;

  } catch (error) {
    console.error("Error generating exam:", error);
    throw error;
  }
}
