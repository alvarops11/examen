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
 * Genera un examen llamando al backend (Cloudflare Worker)
 * La lógica de IA y protección de API Key está en el servidor.
 */
export async function generateExamWithOpenRouter(
  curso: string,
  dificultad: string,
  numeroPreguntas: number,
  numeroRespuestas: number,
  temario: string
): Promise<ExamResponse> {

  const WORKER_URL = getBaseUrl() + "/api/generate";

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Note: We are NOT sending the apiKey here anymore. The backend should have it.
      body: JSON.stringify({
        curso,
        dificultad,
        numeroPreguntas,
        numeroRespuestas,
        temario
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error del servidor: ${response.status}`);
    }

    const data: ExamResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Error generating exam:", error);
    throw error;
  }
}
