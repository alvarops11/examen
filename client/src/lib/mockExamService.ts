/**
 * Servicio Mock para Desarrollo
 * Simula respuestas del Cloudflare Worker cuando no está disponible
 */

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

export async function generateMockExam(
  curso: string,
  dificultad: string,
  numeroPreguntas: number,
  temario: string
): Promise<ExamResponse> {
  // Simular delay de procesamiento
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generar preguntas mock basadas en el temario
  const preguntas: ExamQuestion[] = [];

  // Extraer palabras clave del temario
  const palabrasClaves = temario
    .split(/[\s,.:;!?]+/)
    .filter((p) => p.length > 5)
    .slice(0, Math.min(10, numeroPreguntas));

  for (let i = 1; i <= Math.min(numeroPreguntas, 5); i++) {
    const palabraClave =
      palabrasClaves[i % palabrasClaves.length] || "concepto";

    preguntas.push({
      id: i,
      question: `¿Cuál es la importancia de "${palabraClave}" en el contexto del temario?`,
      choices: [
        `Es fundamental para entender ${palabraClave}`,
        `No tiene relevancia en este tema`,
        `Solo se aplica en casos específicos`,
        `Es un concepto secundario`,
      ],
      answerIndex: 0,
      explanation: `Según el temario proporcionado, "${palabraClave}" es un concepto clave que debe ser comprendido para dominar esta materia. La respuesta correcta destaca su importancia fundamental.`,
    });
  }

  return {
    title: `Examen - ${curso}`,
    difficulty: dificultad,
    questions: preguntas,
  };
}
