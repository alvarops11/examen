import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles, X } from "lucide-react";
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
            initial={{ opacity: 0, y: -40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.98 }}
            transition={{ duration: 0.42, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed top-4 left-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 16px 48px rgba(79,70,229,0.20)",
                  "0 20px 58px rgba(79,70,229,0.30)",
                  "0 16px 48px rgba(79,70,229,0.20)",
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative overflow-hidden rounded-lg border border-indigo-200 bg-white"
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-100/70 via-fuchsia-100/60 to-cyan-100/70"
                animate={{ x: ["-8%", "8%", "-8%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex items-start gap-4 p-4 sm:p-5">
                <motion.div
                  className="mt-0.5 rounded-md bg-indigo-50 p-2 text-indigo-600"
                  animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={dismissBig}
                  className="mt-[-2px] text-slate-500 hover:text-slate-800"
                  aria-label="Cerrar anuncio principal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
