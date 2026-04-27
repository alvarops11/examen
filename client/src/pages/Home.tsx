import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, Sparkles, BookOpen, GraduationCap, BrainCircuit, CheckCircle2, XCircle, ArrowRight, Download, Zap, Target, TimerReset, Play, Pause, Hourglass, Clock3, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { generateExamWithOpenRouter, trackVisit, trackEvent } from "@/lib/geminiService";
import { generateExamPDF } from "@/lib/pdfService";
import { motion, AnimatePresence } from "framer-motion";
import CookieBanner from "@/components/CookieBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UpdateBanner from "@/components/UpdateBanner";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";

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

const STUDY_FACTS = [
  "¿Sabías que dormir después de estudiar ayuda a consolidar la memoria?",
  "La técnica Pomodoro (25 min estudio, 5 min descanso) mejora la productividad.",
  "Enseñar lo aprendido a otra persona es una de las mejores formas de estudiar.",
  "Mantenerte hidratado ayuda a tu cerebro a procesar la información más rápido.",
  "Escribir a mano tus apuntes ayuda a recordar mejor que teclear.",
  "Hacerte auto-exámenes como este reduce la ansiedad ante el examen real."
];

const TIMER_PRESETS = [15, 30, 45, 60];
const EXAM_FEEDBACK_OPTIONS = [
  { score: 1, emoji: "😞", label: "Muy mala" },
  { score: 2, emoji: "🙁", label: "Mejorable" },
  { score: 3, emoji: "😐", label: "Aceptable" },
  { score: 4, emoji: "🙂", label: "Buena" },
  { score: 5, emoji: "🤩", label: "Excelente" },
];

type TimerMode = "down" | "up";

const formatTimer = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
};





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
    blancas: number;
    total: number;
    porcentaje: number;
  } | null>(null);

  const [progressMessage, setProgressMessage] = useState("Iniciando conexión...");
  const [timerMode, setTimerMode] = useState<TimerMode>("down");
  const [timerMinutesInput, setTimerMinutesInput] = useState("45");
  const [timerDurationSeconds, setTimerDurationSeconds] = useState(45 * 60);
  const [timerSeconds, setTimerSeconds] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMinimized, setTimerMinimized] = useState(true);
  const [showFeedbackSurvey, setShowFeedbackSurvey] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Juego de espera: Reacción
  const [score, setScore] = useState(0);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });

  const moveTarget = () => {
    const top = Math.floor(Math.random() * 70) + 15 + '%';
    const left = Math.floor(Math.random() * 70) + 15 + '%';
    setTargetPos({ top, left });
    setScore((s: number) => s + 1);
  };

  const applyTimerDuration = (minutes: number) => {
    const safeMinutes = Math.min(180, Math.max(1, Math.round(minutes)));
    const nextDuration = safeMinutes * 60;
    setTimerMinutesInput(String(safeMinutes));
    setTimerDurationSeconds(nextDuration);
    setTimerSeconds(timerMode === "down" ? nextDuration : 0);
    setTimerRunning(false);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimerSeconds(timerMode === "down" ? timerDurationSeconds : 0);
  };

  const handleTimerModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    setTimerRunning(false);
    setTimerSeconds(mode === "down" ? timerDurationSeconds : 0);
  };

  const handleTimerMinutesBlur = () => {
    const parsed = Number(timerMinutesInput);
    if (!Number.isFinite(parsed)) {
      setTimerMinutesInput(String(Math.max(1, Math.round(timerDurationSeconds / 60))));
      return;
    }
    applyTimerDuration(parsed);
  };

  useEffect(() => {
    trackVisit();
  }, []);

  // Rotar datos curiosos mientras carga
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setCurrentFactIndex((prev: number) => (prev + 1) % STUDY_FACTS.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!examen || !timerRunning) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((currentSeconds) => {
        if (timerMode === "down") {
          if (currentSeconds <= 1) {
            window.clearInterval(interval);
            setTimerRunning(false);
            toast.success("Tiempo finalizado");
            return 0;
          }
          return currentSeconds - 1;
        }

        return currentSeconds + 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [examen, timerMode, timerRunning]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeExtractedText = (text: string): string => {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

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

      const cleanedText = normalizeExtractedText(fullText);
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
    setProgressMessage("Iniciando conexión segura...");
    try {
      const data = await generateExamWithOpenRouter(
        curso, 
        dificultad, 
        numeroPreguntas, 
        numeroRespuestas, 
        temario,
        (msg) => setProgressMessage(msg)
      );
      setExamen(data);
      setRespuestas(new Array(data.questions.length).fill(null));
      setCorregido(false);
      setCalificacion(null);
      setTimerRunning(false);
      setTimerMinimized(true);
      setShowFeedbackSurvey(false);
      setFeedbackSubmitted(false);
      setTimerSeconds(timerMode === "down" ? timerDurationSeconds : 0);
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
    let blancas = 0;
    respuestas.forEach((respuesta, index) => {
      if (respuesta === examen.questions[index].answerIndex) aciertos++;
      if (respuesta === null) blancas++;
    });
    const porcentaje = Math.round((aciertos / examen.questions.length) * 100);
    setCalificacion({ aciertos, blancas, total: examen.questions.length, porcentaje });
    setCorregido(true);
    setShowFeedbackSurvey(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (porcentaje >= 50) {
      // Confetti celebration — dos ráfagas laterales
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          origin: { y: 0.6 },
          zIndex: 9999,
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
        });
      };
      setTimeout(() => {
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#6366f1', '#8b5cf6', '#a78bfa'] });
        fire(0.2,  { spread: 60, colors: ['#6366f1', '#c4b5fd', '#ffffff'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#818cf8', '#7c3aed', '#ddd6fe'] });
        fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#a5f3fc', '#6366f1'] });
        fire(0.1,  { spread: 120, startVelocity: 45, colors: ['#ffffff', '#c7d2fe'] });
      }, 300);
    }
  };

  // Nuevo examen
  const handleNuevoExamen = () => {
    setExamen(null);
    setRespuestas([]);
    setCorregido(false);
    setCalificacion(null);
    setTimerRunning(false);
    setTimerMinimized(true);
    setShowFeedbackSurvey(false);
    setFeedbackSubmitted(false);
    setTimerSeconds(timerMode === "down" ? timerDurationSeconds : 0);
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

  const handleFeedbackVote = async (score: number) => {
    try {
      await trackEvent("exam_rating", { rating: score });
      setFeedbackSubmitted(true);
      setShowFeedbackSurvey(false);
      toast.success("Gracias por valorar la calidad del examen");
    } catch (error) {
      console.error("Error tracking rating:", error);
      toast.error("No se pudo registrar la valoración");
    }
  };

  const displayedTimer = formatTimer(timerSeconds);
  const timerGradientClass = timerMode === "down" && timerSeconds <= 300
    ? "from-rose-500 to-orange-500"
    : "from-indigo-600 to-violet-600";
  const timerTextClass = timerMode === "down" && timerSeconds <= 300
    ? "text-rose-600"
    : "text-indigo-600";

  return (
    <div className="min-h-screen overflow-x-hidden relative flex flex-col">
      <SEO />
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
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative glass-card p-12 rounded-[3rem] border-indigo-100/50 shadow-2xl max-w-2xl w-full">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                      <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-fuchsia-500 animate-bounce" />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900">Generando tu Examen</h2>
                      <p className="text-slate-500 font-medium">Esto tardará solo un momento. Aprovecha para repasar...</p>
                    </div>

                    {/* Progress Bar Simulated */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                      <motion.div 
                        className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 h-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "95%" }}
                        transition={{ duration: 45, ease: "linear" }}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-indigo-700 font-semibold bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                      <Zap className="w-4 h-4 animate-pulse" />
                      <span className="text-sm uppercase tracking-wider">{progressMessage}</span>
                    </div>

                    {/* Fun/Study Facts Carousel */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentFactIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="min-h-[80px] flex items-center justify-center"
                      >
                        <p className="text-slate-600 italic text-lg px-8">
                          "{STUDY_FACTS[currentFactIndex]}"
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    <div className="w-full border-t border-slate-100 my-4" />

                    {/* Mini Game: Reaction */}
                    <div className="w-full space-y-4">
                      <div className="flex justify-between items-center px-4">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mini-Juego de Reacción</span>
                        <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-mono flex items-center gap-2">
                          <Target className="w-4 h-4 text-fuchsia-400" />
                          Puntos: {score}
                        </div>
                      </div>
                      
                      <div className="relative h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden cursor-crosshair group">
                        <motion.button
                          onClick={moveTarget}
                          style={{ top: targetPos.top, left: targetPos.left }}
                          className="absolute w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Zap className="w-6 h-6" />
                        </motion.button>
                        {score === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 font-bold uppercase tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">
                            ¡Haz clic en el rayo!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !examen ? (
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
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurso(e.target.value)}
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
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDificultad(e.target.value)}
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
              {/* Vertical Fixed Progress Bar (right side) */}
              {!corregido && (() => {
                const respondidas = respuestas.filter(r => r !== null).length;
                const total = examen.questions.length;
                const pct = Math.round((respondidas / total) * 100);
                const barColor = pct === 100 ? 'from-green-400 to-emerald-500' : pct >= 50 ? 'from-indigo-500 to-violet-500' : 'from-indigo-400 to-indigo-500';
                const textColor = pct === 100 ? 'text-green-600' : 'text-indigo-600';
                return (
                  <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2">
                    {/* Percentage label */}
                    <span className={`text-xs font-black ${textColor}`}>{pct}%</span>
                    {/* Vertical track */}
                    <div className="w-2 h-48 bg-slate-100 rounded-full overflow-hidden flex flex-col-reverse shadow-inner">
                      <motion.div
                        className={`w-full rounded-full bg-gradient-to-t ${barColor}`}
                        initial={{ height: '0%' }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    {/* Count label */}
                    <span className="text-xs font-bold text-slate-400 leading-tight text-center">
                      <span className={textColor}>{respondidas}</span>/{total}
                    </span>
                  </div>
                );
              })()}
              <div className="xl:hidden sticky top-20 z-30">
                <div className="mb-5 rounded-[1.5rem] border border-indigo-100 bg-white/92 backdrop-blur-xl shadow-[0_18px_50px_rgba(79,70,229,0.12)] p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {timerMode === "down" ? <Hourglass className="w-3.5 h-3.5" /> : <Clock3 className="w-3.5 h-3.5" />}
                        Tiempo de examen
                      </div>
                      <div className={`mt-1.5 text-[1.65rem] font-black ${timerTextClass}`}>{displayedTimer}</div>
                    </div>
                    <div className={`rounded-2xl bg-gradient-to-br ${timerGradientClass} p-2.5 text-white shadow-lg`}>
                      {timerMode === "down" ? <Hourglass className="w-4.5 h-4.5" /> : <Clock3 className="w-4.5 h-4.5" />}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={timerMode === "down" ? "default" : "outline"}
                      onClick={() => handleTimerModeChange("down")}
                      className={`h-9 rounded-xl px-2 text-[11px] leading-tight whitespace-normal ${timerMode === "down" ? "btn-gradient text-white" : "border-indigo-100 text-slate-600"}`}
                    >
                      Temporizador
                    </Button>
                    <Button
                      type="button"
                      variant={timerMode === "up" ? "default" : "outline"}
                      onClick={() => handleTimerModeChange("up")}
                      className={`h-9 rounded-xl px-2 text-[11px] leading-tight whitespace-normal ${timerMode === "up" ? "btn-gradient text-white" : "border-indigo-100 text-slate-600"}`}
                    >
                      Cronometro
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={timerMinutesInput}
                      onChange={(e) => setTimerMinutesInput(e.target.value)}
                      onBlur={handleTimerMinutesBlur}
                      className="h-9 rounded-xl border-indigo-100 text-sm"
                    />
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">min</span>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {TIMER_PRESETS.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        onClick={() => applyTimerDuration(preset)}
                        className="h-8 rounded-lg border-indigo-100 px-0 text-[11px] font-bold text-slate-600"
                      >
                        {preset}m
                      </Button>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      onClick={() => setTimerRunning((current) => !current)}
                      className="h-9 rounded-xl btn-gradient text-xs"
                    >
                      {timerRunning ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                      {timerRunning ? "Pausar" : "Iniciar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTimerReset}
                      className="h-9 rounded-xl border-indigo-100 text-xs text-slate-600"
                    >
                      <TimerReset className="w-3.5 h-3.5 mr-1.5" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
              <div className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
                {timerMinimized ? (
                  <div className="w-[74px] rounded-[24px] border border-indigo-100 bg-white/92 backdrop-blur-xl shadow-[0_20px_60px_rgba(79,70,229,0.14)] px-2.5 py-3">
                    <div className="flex flex-col items-center gap-2.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setTimerMinimized(false)}
                        className="h-7 w-7 rounded-full text-slate-500 hover:text-indigo-600"
                        aria-label="Mostrar reloj"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                      <div className={`text-center text-[11px] font-black leading-tight ${timerTextClass}`}>{displayedTimer}</div>
                      <div className={`rounded-2xl bg-gradient-to-br ${timerGradientClass} p-2 text-white shadow-lg`}>
                        {timerMode === "down" ? <Hourglass className="w-3.5 h-3.5" /> : <Clock3 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="w-[220px] rounded-[26px] border border-indigo-100 bg-white/92 backdrop-blur-xl shadow-[0_20px_60px_rgba(79,70,229,0.14)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {timerMode === "down" ? <Hourglass className="w-3.5 h-3.5" /> : <Clock3 className="w-3.5 h-3.5" />}
                        Cronómetro
                      </div>
                      <div className={`mt-2.5 text-[1.75rem] leading-none font-black ${timerTextClass}`}>{displayedTimer}</div>
                    </div>
                    <div className={`rounded-2xl bg-gradient-to-br ${timerGradientClass} p-2.5 text-white shadow-lg`}>
                      {timerMode === "down" ? <Hourglass className="w-4.5 h-4.5" /> : <Clock3 className="w-4.5 h-4.5" />}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTimerMinimized(true)}
                      className="h-7 rounded-lg px-2 text-xs text-slate-500 hover:text-indigo-600"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                      Minimizar
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={timerMode === "down" ? "default" : "outline"}
                      onClick={() => handleTimerModeChange("down")}
                      className={`h-9 rounded-xl px-2 text-[11px] leading-tight whitespace-normal ${timerMode === "down" ? "btn-gradient text-white" : "border-indigo-100 text-slate-600"}`}
                    >
                      Temporizador
                    </Button>
                    <Button
                      type="button"
                      variant={timerMode === "up" ? "default" : "outline"}
                      onClick={() => handleTimerModeChange("up")}
                      className={`h-9 rounded-xl px-2 text-[11px] leading-tight whitespace-normal ${timerMode === "up" ? "btn-gradient text-white" : "border-indigo-100 text-slate-600"}`}
                    >
                      Cronometro
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={timerMinutesInput}
                      onChange={(e) => setTimerMinutesInput(e.target.value)}
                      onBlur={handleTimerMinutesBlur}
                      className="h-9 rounded-xl border-indigo-100 text-sm"
                    />
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">min</span>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {TIMER_PRESETS.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        onClick={() => applyTimerDuration(preset)}
                        className="h-8 rounded-lg border-indigo-100 px-0 text-[11px] font-bold text-slate-600"
                      >
                        {preset}m
                      </Button>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      onClick={() => setTimerRunning((current) => !current)}
                      className="h-9 rounded-xl btn-gradient text-xs"
                    >
                      {timerRunning ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                      {timerRunning ? "Pausar" : "Iniciar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTimerReset}
                      className="h-9 rounded-xl border-indigo-100 text-xs text-slate-600"
                    >
                      <TimerReset className="w-3.5 h-3.5 mr-1.5" />
                      Reset
                    </Button>
                  </div>
                </div>
                )}
              </div>
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
                          {calificacion.total - calificacion.aciertos - calificacion.blancas} Fallos
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-semibold">
                          <BookOpen className="w-4 h-4" />
                          {calificacion.blancas} En Blanco
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
                                className={`relative flex items-start p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 group
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
                                {/* Letter badge A/B/C/D */}
                                <div className={`flex-shrink-0 w-7 h-7 rounded-lg text-xs font-black mr-4 flex items-center justify-center transition-all
                                    ${isCorrect ? "bg-green-500 text-white" : isWrongAttempt ? "bg-red-500 text-white" : isSelected ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"}
                                  `}>
                                  {String.fromCharCode(65 + cIndex)}
                                </div>

                                <span className={`text-sm font-medium leading-relaxed pt-0.5 flex-1 ${isSelected && !isCorrect && !isWrongAttempt ? "text-indigo-900" : isCorrect ? "text-green-800" : isWrongAttempt ? "text-red-800" : "text-slate-600"}`}>
                                  {choice}
                                </span>

                                {corregido && (isCorrect || isWrongAttempt) && (
                                  <div className="ml-3 flex-shrink-0 pt-0.5">
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

              <AnimatePresence>
                {corregido && showFeedbackSurvey && !feedbackSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm sm:inset-x-auto sm:right-6 sm:left-auto sm:w-[340px]"
                  >
                    <div className="rounded-[1.5rem] border border-indigo-100 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(79,70,229,0.14)] p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 pr-1">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-500">Tu opinión</p>
                          <h3 className="mt-1.5 text-sm font-bold leading-tight text-slate-900 sm:text-base">¿Cómo te ha parecido este examen?</h3>
                          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Valóralo en un momento o cierra este aviso si prefieres seguir.</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowFeedbackSurvey(false)}
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700"
                          aria-label="Cerrar encuesta"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
                        {EXAM_FEEDBACK_OPTIONS.map((option) => (
                          <button
                            key={option.score}
                            type="button"
                            onClick={() => handleFeedbackVote(option.score)}
                            aria-label={option.label}
                            title={option.label}
                            className="aspect-square min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-1 py-2 text-center transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-0.5 sm:aspect-auto sm:px-2 sm:py-3"
                          >
                            <div className="text-2xl leading-none sm:text-3xl">{option.emoji}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>


            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Features Section for AdSense Content */}
      {!examen && !loading && (
        <section className="py-24 px-4 bg-white/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
                Mucho más que un simple <span className="text-gradient">generador de tests</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                ExamSphere utiliza algoritmos avanzados de procesamiento de lenguaje natural para entender tus apuntes y crear desafíos académicos reales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Comprensión Profunda</h3>
                <p className="text-slate-600 leading-relaxed">
                  Nuestra IA analiza la jerarquía de tus temas, identificando conceptos clave y relaciones complejas para generar preguntas que evalúan la comprensión, no solo la memoria.
                </p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Precisión Académica</h3>
                <p className="text-slate-600 leading-relaxed">
                  Ajusta la dificultad para que coincida con el nivel real de tus exámenes universitarios. Desde conceptos básicos hasta casos prácticos avanzados.
                </p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Ahorro de Tiempo</h3>
                <p className="text-slate-600 leading-relaxed">
                  Deja de pasar horas redactando tus propios tests. Invierte tu tiempo en lo que importa: estudiar y practicar con feedback inmediato.
                </p>
              </div>
            </div>

            {/* Informational Text Block */}
            <div className="mt-20 glass-card p-12 rounded-[3rem] border border-indigo-50 bg-white/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">¿Por qué usar IA para estudiar?</h3>
                  <div className="space-y-4 text-slate-700 leading-relaxed">
                    <p>
                      La ciencia del aprendizaje es clara: la <strong>autoevaluación</strong> es la técnica más efectiva para retener información a largo plazo. Sin embargo, crear buenos exámenes es una tarea ardua y sesgada.
                    </p>
                    <p>
                      ExamSphere elimina esa barrera, permitiéndote aplicar el <em>Active Recall</em> de forma instantánea. Nuestra plataforma está diseñada por y para estudiantes, priorizando la facilidad de uso y la calidad del contenido generado.
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs">Prueba de Eficacia</p>
                    <p className="text-3xl font-black mb-4">+70%</p>
                    <p className="text-slate-400">De mejora media en la retención detectada en usuarios que practican con tests IA frente a lectura pasiva.</p>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <UpdateBanner />
      <CookieBanner />
    </div>
  );
}

