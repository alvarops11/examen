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

  // Construct Worker URL. In development it might be different or proxied.
  // Ideally defined in .env
  const WORKER_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787/api/generate";

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
