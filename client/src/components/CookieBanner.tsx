import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const cookiesAccepted = localStorage.getItem("cookiesAccepted");
        if (!cookiesAccepted) {
            // Show banner after a small delay for better UX
            setTimeout(() => setShowBanner(true), 1000);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookiesAccepted", "true");
        setShowBanner(false);
    };

    const rejectCookies = () => {
        localStorage.setItem("cookiesAccepted", "false");
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-5xl mx-auto glass-card rounded-2xl p-6 md:p-8 shadow-2xl border border-indigo-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    🍪 Uso de Cookies
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Utilizamos <strong>únicamente cookies técnicas esenciales</strong> para el funcionamiento básico de ExamSphere (guardar tu API key y preferencias localmente en tu navegador).
                                    No utilizamos cookies de seguimiento, analíticas ni publicitarias.
                                    Toda la información se almacena en tu dispositivo mediante localStorage.{" "}
                                    <a href="/cookies" className="text-indigo-600 hover:underline font-medium">
                                        Más información
                                    </a>
                                </p>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <Button
                                    onClick={acceptCookies}
                                    className="flex-1 md:flex-initial btn-gradient rounded-xl px-6"
                                >
                                    Aceptar
                                </Button>
                                <Button
                                    onClick={rejectCookies}
                                    variant="outline"
                                    className="border-slate-200 hover:bg-slate-50 rounded-xl px-6"
                                >
                                    Rechazar
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
