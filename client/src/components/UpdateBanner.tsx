import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const UPDATE_ID = "2026-05-examsphere-2-0";
const STORAGE_KEY = `updateBannerDismissed:${UPDATE_ID}`;

export default function UpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = window.setTimeout(() => setVisible(true), 1400);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed right-4 bottom-4 z-50 max-w-sm"
        >
          <div className="rounded-lg border border-indigo-200 bg-white shadow-xl">
            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5 rounded-md bg-indigo-50 p-2 text-indigo-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Llega ExamSphere 2.0
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Hemos actualizado nuestros modelos de IA con una generación más potente e inteligente y un control de calidad mucho más sólido.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={dismiss}
                className="mt-[-2px] text-slate-400 hover:text-slate-700"
                aria-label="Cerrar notificacion"
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
