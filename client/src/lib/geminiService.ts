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
  apiKey: string, // Kept for interface compatibility but might be unused if we fully rely on backend env. 
  // HOWEVER, the current plan says backend has key. 
  // If I change the signature I might break the calling component.
  // For now, I will keep the signature but ignore the apiKey arg or pass it if the backend relied on it (it doesn't, it uses env).
  curso: string,
  dificultad: string,
  numeroPreguntas: number,
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
