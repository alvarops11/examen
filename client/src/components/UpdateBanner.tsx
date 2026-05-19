import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SMALL_UPDATE_ID = "2026-05-exam-type-vf";
const SMALL_STORAGE_KEY = `updateBannerDismissed:${SMALL_UPDATE_ID}`;

export default function UpdateBanner() {
  const [showSmall, setShowSmall] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    if (!localStorage.getItem(SMALL_STORAGE_KEY)) {
      timers.push(window.setTimeout(() => setShowSmall(true), 900));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const dismissSmall = () => {
    localStorage.setItem(SMALL_STORAGE_KEY, "true");
    setShowSmall(false);
  };

  return (
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
                  Nueva actualización disponible
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Ahora puedes elegir Tipo Test o Verdadero/Falso al generar tu examen para adaptar mejor la práctica a tu forma de estudio.
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
  );
}
