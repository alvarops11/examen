import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, Sparkles, BookOpen, GraduationCap, BrainCircuit, CheckCircle2, XCircle, ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";
import { generateExamWithOpenRouter, trackVisit, trackEvent } from "@/lib/geminiService";
import { generateExamPDF } from "@/lib/pdfService";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import CookieBanner from "@/components/CookieBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";

/**
 * Diseño: Neo-Academic Premium
 * - Visual: Glassmorphism, Gradientes suaves, Sombras profundas
 * - Interacción: Animaciones fluidas (Framer Motion)
 * - Tipografía: Jerarquía clara y elegante
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

export default function Home() {
  // Estado del formulario
  const [curso, setCurso] = useState("1º");
  const [dificultad, setDificultad] = useState("media");
  const [numeroPreguntas, setNumeroPreguntas] = useState(20);
  const [numeroRespuestas, setNumeroRespuestas] = useState(4);
  const [temario, setTemario] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado del examen
  const [examen, setExamen] = useState<ExamData | null>(null);
  const [respuestas, setRespuestas] = useState<(number | null)[]>([]);
  const [corregido, setCorregido] = useState(false);
  const [calificacion, setCalificacion] = useState<{
    aciertos: number;
    total: number;
    porcentaje: number;
  } | null>(null);

  useEffect(() => {
    trackVisit();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraer texto de PDF usando pdfjs-dist
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n\n";
      }

      const cleanedText = fullText.replace(/\s+/g, " ").trim();
      if (!cleanedText || cleanedText.length < 10) {
        throw new Error("No se pudo extraer texto válido del PDF");
      }
      return cleanedText;
    } catch (error) {
      console.error("Error extracting PDF:", error);
      throw new Error("No se pudo extraer el texto del PDF. Asegúrate de que no esté protegido o sea una imagen.");
    }
  };

  // Manejar carga de archivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setTemario(event.target?.result as string);
          toast.success("Archivo de texto cargado correctamente");
        };
        reader.readAsText(file);
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const toastId = toast.loading("Procesando PDF...");
        try {
          const content = await extractTextFromPDF(file);
          setTemario(content);
          toast.dismiss(toastId);
          toast.success("PDF cargado correctamente");
        } catch (err) {
          toast.dismiss(toastId);
          throw err;
        }
      } else {
        toast.error("Por favor, carga un archivo .txt o .pdf");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error al procesar archivo");
    }
  };

  // Generar examen
  const handleGenerarExamen = async () => {
    if (!temario.trim()) return toast.error("Por favor, ingresa el temario");

    setLoading(true);
    try {
      const data = await generateExamWithOpenRouter(curso, dificultad, numeroPreguntas, numeroRespuestas, temario);
      setExamen(data);
      setRespuestas(new Array(data.questions.length).fill(null));
      setCorregido(false);
      setCalificacion(null);
      toast.success("Examen generado correctamente");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar el examen");
    } finally {
      setLoading(false);
    }
  };

  // Manejar respuesta
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
      if (respuesta === examen.questions[index].answerIndex) aciertos++;
    });
    const porcentaje = Math.round((aciertos / examen.questions.length) * 100);
    setCalificacion({ aciertos, total: examen.questions.length, porcentaje });
    setCorregido(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Nuevo examen
  const handleNuevoExamen = () => {
    setExamen(null);
    setRespuestas([]);
    setCorregido(false);
    setCalificacion(null);
  };

  // Descargar PDF
  const handleDownloadPDF = (isCorregido: boolean) => {
    if (!examen) return;
    try {
      trackEvent(isCorregido ? "pdf_corrected" : "pdf_normal");
      generateExamPDF(examen, curso, isCorregido);
      toast.success(`PDF ${isCorregido ? "corregido " : ""}descargado correctamente`);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative flex flex-col">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      <Header
        showExit={!!examen}
        onExit={handleNuevoExamen}
      />

      <main className="max-w-5xl mx-auto px-4 py-12 flex-grow">
        <AnimatePresence mode="wait">
          {!examen ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6 border border-indigo-100 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Potenciado con Inteligencia Artificial</span>
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Crea exámenes <span className="text-gradient">impecables</span><br />en segundos.
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Sube tus apuntes, elige el nivel y crea tu examen con IA al instante.
                </p>
              </div>

              <motion.div
                className="glass-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-[100%] z-0" />

                <div className="relative z-10 grid gap-8">
                  {/* Settings Grid */}
                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Nivel Académico</label>
                      <div className="relative">
                        <select
                          value={curso}
                          onChange={(e) => setCurso(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 glass-input rounded-xl text-slate-700 appearance-none font-medium cursor-pointer"
                        >
                          {CURSOS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <GraduationCap className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Dificultad</label>
                      <div className="relative">
                        <select
                          value={dificultad}
                          onChange={(e) => setDificultad(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 glass-input rounded-xl text-slate-700 appearance-none font-medium cursor-pointer"
                        >
                          <option value="facil">Básica</option>
                          <option value="media">Intermedia</option>
                          <option value="dificil">Avanzada</option>
                        </select>
                        <BrainCircuit className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Preguntas</label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={numeroPreguntas}
                        onChange={(e) => setNumeroPreguntas(parseInt(e.target.value))}
                        className="w-full px-4 py-3 glass-input rounded-xl text-slate-700 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Respuestas</label>
                      <div className="relative">
                        <select
                          value={numeroRespuestas}
                          onChange={(e) => setNumeroRespuestas(parseInt(e.target.value))}
                          className="w-full pl-4 pr-10 py-3 glass-input rounded-xl text-slate-700 appearance-none font-medium cursor-pointer"
                        >
                          <option value="2">2 opciones</option>
                          <option value="3">3 opciones</option>
                          <option value="4">4 opciones</option>
                          <option value="5">5 opciones</option>
                          <option value="6">6 opciones</option>
                        </select>
                        <ArrowRight className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center justify-between">
                      <span>Material de Estudio</span>
                      <span className="text-xs text-slate-400 font-normal">Soporta texto y PDF</span>
                    </label>
                    <div className="relative group">
                      <textarea
                        value={temario}
                        onChange={(e) => setTemario(e.target.value)}
                        placeholder="Pega aquí tus apuntes o usa el botón para subir un archivo..."
                        className="w-full h-48 px-6 py-5 glass-input rounded-2xl resize-none text-slate-600 placeholder:text-slate-400 leading-relaxed"
                      />
                      <div className="absolute bottom-4 right-4">
                        <input ref={fileInputRef} type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="hidden" />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white shadow-sm hover:shadow-md border border-slate-100 text-indigo-600 transition-all rounded-xl"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Subir Archivo
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerarExamen}
                    disabled={loading}
                    className="w-full btn-gradient py-6 text-lg tracking-wide rounded-2xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analizando contenido...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Generar Examen
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="exam"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Exam Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-1">
                    Examen {curso}
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-medium capitalize text-slate-700">
                      {dificultad}
                    </span>
                    <span>•</span>
                    <span>{examen.questions.length} preguntas</span>
                  </div>
                </div>

                {/* Score Card - Animated */}
                <AnimatePresence>
                  {calificacion && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100 flex items-center gap-6"
                    >
                      <div className="text-center">
                        <div className="text-sm text-slate-500 font-medium">Nota Final</div>
                        <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                          {(calificacion.porcentaje / 10).toFixed(1)}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-slate-100" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          {calificacion.aciertos} Aciertos
                        </div>
                        <div className="flex items-center gap-2 text-sm text-red-500 font-semibold">
                          <XCircle className="w-4 h-4" />
                          {calificacion.total - calificacion.aciertos} Fallos
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(false)}
                    className="bg-white/50 border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  {corregido && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(true)}
                      className="bg-white/50 border-green-100 text-green-600 hover:bg-green-50 rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF Corregido
                    </Button>
                  )}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {examen.questions.map((question, qIndex) => (
                  <motion.div
                    key={question.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: qIndex * 0.05 }}
                    className={`glass-card rounded-2xl p-6 md:p-8 transition-colors duration-300 ${corregido
                      ? respuestas[qIndex] === question.answerIndex
                        ? "border-green-200 bg-green-50/30"
                        : respuestas[qIndex] !== null
                          ? "border-red-200 bg-red-50/30"
                          : ""
                      : ""
                      }`}
                  >
                    <div className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                        {qIndex + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-800 mb-6 leading-relaxed">
                          {question.question}
                        </h4>

                        <div className="grid gap-3">
                          {question.choices.map((choice, cIndex) => {
                            const isSelected = respuestas[qIndex] === cIndex;
                            const isCorrect = corregido && cIndex === question.answerIndex;
                            const isWrongAttempt = corregido && isSelected && !isCorrect;

                            return (
                              <label
                                key={cIndex}
                                className={`relative flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 group
                                    ${isSelected
                                    ? "border-indigo-500 bg-indigo-50/50"
                                    : "border-transparent bg-slate-50 hover:bg-slate-100"}
                                    ${isCorrect ? "!border-green-500 !bg-green-50" : ""}
                                    ${isWrongAttempt ? "!border-red-500 !bg-red-50" : ""}
                                  `}
                              >
                                <input
                                  type="radio"
                                  name={`question-${qIndex}`}
                                  checked={isSelected}
                                  onChange={() => handleRespuesta(qIndex, cIndex)}
                                  disabled={corregido}
                                  className="hidden"
                                />
                                {/* Custom Checkbox UI */}
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors
                                    ${isSelected ? "border-indigo-500" : "border-slate-300 group-hover:border-indigo-300"}
                                    ${isCorrect ? "!border-green-500" : ""}
                                    ${isWrongAttempt ? "!border-red-500" : ""}
                                  `}>
                                  {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${isCorrect ? "bg-green-500" : isWrongAttempt ? "bg-red-500" : "bg-indigo-500"}`} />}
                                </div>

                                <span className={`text-sm font-medium ${isSelected ? "text-indigo-900" : "text-slate-600"}`}>
                                  {choice}
                                </span>

                                {corregido && (isCorrect || isWrongAttempt) && (
                                  <div className="ml-auto">
                                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                  </div>
                                )}
                              </label>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        <AnimatePresence>
                          {corregido && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-6 overflow-hidden"
                            >
                              <div className="bg-white/50 rounded-xl p-5 border border-indigo-100 flex gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg h-fit">
                                  <BrainCircuit className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Explicación</p>
                                  <p className="text-sm text-slate-700 leading-relaxed">
                                    {question.explanation}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="sticky bottom-8 z-40 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-indigo-100 flex gap-4 max-w-xl mx-auto"
              >
                {!corregido ? (
                  <Button
                    onClick={handleCorregir}
                    className="flex-1 btn-gradient py-6 text-lg rounded-xl"
                  >
                    Corregir Examen
                  </Button>
                ) : (
                  <Button
                    onClick={handleNuevoExamen}
                    className="flex-1 btn-gradient py-6 text-lg rounded-xl shadow-none hover:shadow-lg"
                  >
                    Crear Nuevo Examen
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}
