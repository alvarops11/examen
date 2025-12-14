import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { generateExamWithGemini } from "@/lib/geminiService";

/**
 * Diseño: Minimalismo Académico Moderno
 * - Tipografía: Playfair Display para títulos, Inter para cuerpo
 * - Paleta: Blanco/Grises + Azul académico (#1e40af)
 * - Layout: Grid asimétrico (formulario 40%, examen 60%)
 * - Interacciones: Transiciones suaves, feedback visual discreto
 */

interface ExamQuestion {
  id: number;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

interface ExamData {
  title: string;
  difficulty: string;
  questions: ExamQuestion[];
}

const CURSOS = ["1º", "2º", "3º", "4º", "Máster"];
const DEFAULT_API_KEY = "AIzaSyAXk0eTVSvZcF4L89LgbCWxuaOnu9WPlbc";

export default function Home() {
  // Estado del formulario
  const [curso, setCurso] = useState("1º");
  const [dificultad, setDificultad] = useState("media");
  const [numeroPreguntas, setNumeroPreguntas] = useState(20);
  const [temario, setTemario] = useState("");
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [loading, setLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Estado del examen
  const [examen, setExamen] = useState<ExamData | null>(null);
  const [respuestas, setRespuestas] = useState<(number | null)[]>([]);
  const [corregido, setCorregido] = useState(false);
  const [calificacion, setCalificacion] = useState<{
    aciertos: number;
    total: number;
    porcentaje: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraer texto de PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractPDFText(arrayBuffer);
      return text;
    } catch (error) {
      console.error("Error extracting PDF:", error);
      throw new Error("No se pudo extraer el texto del PDF");
    }
  };

  // Función auxiliar para extraer texto de PDF
  const extractPDFText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const view = new Uint8Array(arrayBuffer);
    let text = "";

    for (let i = 0; i < view.length - 1; i++) {
      const byte = view[i];

      if (
        (byte >= 32 && byte <= 126) ||
        byte === 9 ||
        byte === 10 ||
        byte === 13
      ) {
        text += String.fromCharCode(byte);
      }
    }

    text = text
      .replace(/\x00/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text || text.length < 10) {
      throw new Error("No se pudo extraer texto válido del PDF");
    }

    return text;
  };

  // Manejar carga de archivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setTemario(text);
          toast.success("Archivo de texto cargado correctamente");
        };
        reader.onerror = () => {
          toast.error("Error al cargar el archivo");
        };
        reader.readAsText(file);
      } else if (
        file.type === "application/pdf" ||
        file.name.endsWith(".pdf")
      ) {
        const content = await extractTextFromPDF(file);
        setTemario(content);
        toast.success("PDF cargado correctamente");
      } else {
        toast.error("Por favor, carga un archivo .txt o .pdf");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar el archivo"
      );
    }
  };

  // Generar examen con Gemini
  const handleGenerarExamen = async () => {
    if (!temario.trim()) {
      toast.error("Por favor, ingresa el temario");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Por favor, ingresa una API key de Gemini");
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    try {
      const data = await generateExamWithGemini(
        apiKey,
        curso,
        dificultad,
        numeroPreguntas,
        temario
      );

      setExamen(data);
      setRespuestas(new Array(data.questions.length).fill(null));
      setCorregido(false);
      setCalificacion(null);
      toast.success("Examen generado correctamente");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al generar el examen";
      
      if (errorMessage.includes("cuota") || errorMessage.includes("quota")) {
        toast.error(
          "Límite de cuota excedido. Ingresa otra API key para continuar."
        );
        setShowApiKeyInput(true);
      } else if (errorMessage.includes("API key") || errorMessage.includes("not found")) {
        toast.error("API key inválida. Verifica que sea correcta.");
        setShowApiKeyInput(true);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar respuesta seleccionada
  const handleRespuesta = (questionIndex: number, choiceIndex: number) => {
    if (corregido) return;
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[questionIndex] = choiceIndex;
    setRespuestas(nuevasRespuestas);
  };

  // Corregir examen
  const handleCorregir = () => {
    if (!examen) return;

    let aciertos = 0;
    respuestas.forEach((respuesta, index) => {
      if (respuesta === examen.questions[index].answerIndex) {
        aciertos++;
      }
    });

    const porcentaje = Math.round((aciertos / examen.questions.length) * 100);
    setCalificacion({
      aciertos,
      total: examen.questions.length,
      porcentaje,
    });
    setCorregido(true);
  };

  // Resetear examen
  const handleNuevoExamen = () => {
    setExamen(null);
    setRespuestas([]);
    setCorregido(false);
    setCalificacion(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ExamGen</h1>
          <p className="text-gray-600">
            Generador inteligente de exámenes con IA
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {!examen ? (
          // Formulario
          <Card className="p-8 shadow-sm border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Crear Nuevo Examen
            </h2>

            {/* API Key Input - Solo si se necesita cambiar */}
            {showApiKeyInput && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Key de Google Gemini
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Ingresa tu API key de Gemini..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Obtén tu API key gratis en{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyInput(false)}
                  className="mt-3"
                >
                  Continuar
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Curso */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Curso
                </label>
                <select
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  {CURSOS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dificultad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dificultad
                </label>
                <select
                  value={dificultad}
                  onChange={(e) => setDificultad(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="facil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              {/* Número de Preguntas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Preguntas
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={numeroPreguntas}
                  onChange={(e) => setNumeroPreguntas(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Temario */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Temario
              </label>
              <textarea
                value={temario}
                onChange={(e) => setTemario(e.target.value)}
                placeholder="Pega el contenido del temario aquí..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                O carga un archivo .txt o .pdf:
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Cargar Archivo
              </Button>
            </div>

            {/* Botón Generar */}
            <Button
              onClick={handleGenerarExamen}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando con Gemini...
                </>
              ) : (
                "Generar Examen"
              )}
            </Button>
          </Card>
        ) : (
          // Examen
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Examen - {curso}
              </h2>
              <div className="flex items-center gap-4">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-md">
                  {dificultad === "facil"
                    ? "Fácil"
                    : dificultad === "media"
                      ? "Media"
                      : "Difícil"}
                </span>
                <span className="text-gray-600">
                  {examen.questions.length} preguntas
                </span>
              </div>
            </div>

            {/* Calificación */}
            {calificacion && (
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Resultados
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Calificación</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {calificacion.porcentaje}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Aciertos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {calificacion.aciertos}/{calificacion.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Nota</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(calificacion.porcentaje / 10).toFixed(1)}/10
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Preguntas */}
            <div className="space-y-6">
              {examen.questions.map((question, qIndex) => (
                <Card key={question.id} className="p-6 border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {qIndex + 1}. {question.question}
                  </h4>

                  <div className="space-y-3 mb-6">
                    {question.choices.map((choice, cIndex) => (
                      <label
                        key={cIndex}
                        className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={respuestas[qIndex] === cIndex}
                          onChange={() => handleRespuesta(qIndex, cIndex)}
                          disabled={corregido}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-3 text-gray-700">{choice}</span>
                        {corregido && (
                          <>
                            {cIndex === question.answerIndex && (
                              <span className="ml-auto text-green-600 font-semibold">
                                ✓ Correcta
                              </span>
                            )}
                            {respuestas[qIndex] === cIndex &&
                              cIndex !== question.answerIndex && (
                                <span className="ml-auto text-red-600 font-semibold">
                                  ✗ Incorrecta
                                </span>
                              )}
                          </>
                        )}
                      </label>
                    ))}
                  </div>

                  {corregido && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        Explicación:
                      </p>
                      <p className="text-sm text-gray-700">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4">
              {!corregido ? (
                <Button
                  onClick={handleCorregir}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
                >
                  Corregir Examen
                </Button>
              ) : (
                <Button
                  onClick={handleNuevoExamen}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
                >
                  Nuevo Examen
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
