import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface SplashScreenProps {
    onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        // Show button after initial logo animation
        const timer = setTimeout(() => setShowButton(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            {/* Background with provided image inspiration (Abstract Gradient) */}
            <div className="absolute inset-0 z-0">
                <img src="/splash-bg.png" alt="Background" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center p-6">
                {/* Animated Logo Container */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", type: "spring" }}
                    className="mb-8 relative"
                >
                    {/* Logo Glow */}
                    <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full scale-150 animate-pulse" />

                    <div className="w-32 h-32 md:w-48 md:h-48 bg-white/90 glass-card rounded-full shadow-2xl flex items-center justify-center p-6 backdrop-blur-xl border border-white/50 relative z-10">
                        <img src="/logo.png" alt="ExamSphere" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                </motion.div>

                {/* Title Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="space-y-2 mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 drop-shadow-sm font-display">
                        EXAMSPHERE
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl font-medium tracking-wide">
                        AI POWERED EXCELLENCE
                    </p>
                </motion.div>

                {/* Start Button */}
                <AnimatePresence>
                    {showButton && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5, type: "spring" }}
                        >
                            <Button
                                onClick={onStart}
                                size="lg"
                                className="group relative px-10 py-8 text-xl rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 border border-white/20"
                            >
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                                <span className="relative flex items-center gap-3">
                                    Start Exam
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-10 text-slate-400 text-sm font-medium"
                >
                    Powered by DeepSeek & OpenRouter
                </motion.div>
            </div>
        </motion.div>
    );
}
