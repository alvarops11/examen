import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CheckCircle2, FileText, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BIG_UPDATE_ID = "2026-05-examsphere-2-0";
const BIG_STORAGE_KEY = `updateBannerDismissed:${BIG_UPDATE_ID}`;
const SMALL_UPDATE_ID = "2026-05-error-tutor-trial";
const SMALL_STORAGE_KEY = `updateBannerDismissed:${SMALL_UPDATE_ID}`;

export default function UpdateBanner() {
  const [showBig, setShowBig] = useState(false);
  const [showSmall, setShowSmall] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    if (!localStorage.getItem(BIG_STORAGE_KEY)) {
      timers.push(window.setTimeout(() => setShowBig(true), 600));
    }
    if (!localStorage.getItem(SMALL_STORAGE_KEY)) {
      timers.push(window.setTimeout(() => setShowSmall(true), 1700));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const dismissBig = () => {
    localStorage.setItem(BIG_STORAGE_KEY, "true");
    setShowBig(false);
  };

  const dismissSmall = () => {
    localStorage.setItem(SMALL_STORAGE_KEY, "true");
    setShowSmall(false);
  };

  return (
    <>
      <AnimatePresence>
        {showBig && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 left-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, -1, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative overflow-hidden rounded-lg border border-indigo-200 bg-white"
              style={{ boxShadow: "0 16px 48px rgba(79,70,229,0.20)" }}
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-100"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(99,102,241,0.12) 0%, rgba(236,72,153,0.08) 45%, rgba(6,182,212,0.10) 100%)",
                }}
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-x-10 inset-y-0 opacity-45"
                style={{
                  background:
                    "repeating-linear-gradient(102deg, rgba(99,102,241,0.00) 0px, rgba(99,102,241,0.00) 18px, rgba(99,102,241,0.10) 19px, rgba(99,102,241,0.00) 26px)",
                }}
                animate={{ x: ["-4%", "4%"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 70% at 10% 0%, rgba(255,255,255,0.45), rgba(255,255,255,0) 42%), radial-gradient(120% 70% at 90% 100%, rgba(255,255,255,0.32), rgba(255,255,255,0) 40%)",
                }}
                animate={{ opacity: [0.45, 0.62, 0.45] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="pointer-events-none absolute right-12 top-2 hidden lg:block">
                <motion.div
                  className="relative h-20 w-28"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    className="absolute left-0 top-7 text-indigo-600/80"
                    animate={{ rotate: [-3, 3, -3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <BookOpen className="h-10 w-10" />
                  </motion.div>
                  <motion.div
                    className="absolute right-0 top-1 rounded-md border border-indigo-200 bg-white/85 p-1.5 text-indigo-500 shadow-sm backdrop-blur-sm"
                    initial={{ opacity: 0.5, x: 0, y: 0 }}
                    animate={{ opacity: [0.55, 1, 0.55], x: [-2, 3, -2], y: [0, -3, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FileText className="h-5 w-5" />
                  </motion.div>
                  <motion.div
                    className="absolute right-3 top-10 h-0.5 w-9 rounded bg-indigo-300/70"
                    animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
              <div className="relative flex items-start gap-4 p-4 pr-12 sm:p-5 sm:pr-14 lg:pr-36">
                <motion.div
                  className="mt-0.5 rounded-md bg-indigo-50 p-2 text-indigo-600"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-slate-900 sm:text-lg">
                    Llega ExamSphere 2.0
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700 sm:text-[15px]">
                    Hemos actualizado nuestros modelos de IA a una generación mucho más potente e inteligente y hemos reforzado de forma notable el control de calidad de los exámenes.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={dismissBig}
                className="absolute right-1 top-1 z-10 bg-white/80 text-slate-500 hover:bg-white hover:text-slate-800 sm:right-1.5 sm:top-1.5"
                aria-label="Cerrar anuncio principal"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSmall && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed right-4 bottom-4 z-50 max-w-sm"
          >
            <div className="rounded-lg border border-emerald-200 bg-white shadow-xl">
              <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5 rounded-md bg-emerald-50 p-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Nueva mejora en prueba
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Ya puedes probar el Tutor de errores para consultar dudas sobre preguntas concretas al terminar tu examen.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={dismissSmall}
                  className="mt-[-2px] text-slate-400 hover:text-slate-700"
                  aria-label="Cerrar notificación"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
