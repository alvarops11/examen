import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, HelpCircle, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function FAQ() {
    const faqs = [
        {
            question: "¿Qué es ExamSphere?",
            answer: "ExamSphere es una plataforma educativa avanzada que utiliza Inteligencia Artificial para generar exámenes tipo test personalizados a partir de tus propios apuntes, documentos PDF o texto pegado directamente."
        },
        {
            question: "¿Qué tipos de archivos puedo subir?",
            answer: "Actualmente admitimos archivos PDF (.pdf) y archivos de texto plano (.txt). También puedes copiar y pegar el contenido directamente en el área de texto si lo prefieres."
        },
        {
            question: "¿Es gratuita la plataforma?",
            answer: "Sí, ExamSphere es actualmente una herramienta gratuita sin ánimo de lucro diseñada para ayudar a estudiantes de todos los niveles a preparar sus exámenes de manera más eficiente."
        },
        {
            question: "¿Qué IA utiliza para generar las preguntas?",
            answer: "Utilizamos modelos de lenguaje de última generación optimizados para la comprensión de textos educativos y la generación de preguntas coherentes y pedagógicamente útiles."
        },
        {
            question: "¿Cuántas preguntas puedo generar a la vez?",
            answer: "Puedes generar desde 5 hasta 50 preguntas por examen. Recomendamos subir material suficiente para asegurar que las preguntas tengan variedad y cubran todo el temario."
        },
        {
            question: "¿Se guardan mis datos o documentos?",
            answer: "No almacenamos los contenidos de tus documentos de forma permanente. El texto se procesa en tiempo real para generar el examen y luego se descarta. Tu privacidad es nuestra prioridad."
        },
        {
            question: "¿Puedo usarlo en el móvil?",
            answer: "¡Por supuesto! La interfaz de ExamSphere es totalmente responsive, lo que significa que puedes generar y realizar exámenes desde tu smartphone, tablet u ordenador."
        }
    ];

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="min-h-screen flex flex-col">
            <SEO
                title="Preguntas Frecuentes"
                description="Resuelve tus dudas sobre ExamSphere: cómo funciona, privacidad, tipos de archivos y más."
                canonicalPath="/faq"
            />
            <Header />

            <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
                        <HelpCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Preguntas <span className="text-gradient">Frecuentes</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        ¿Tienes dudas sobre cómo funciona ExamSphere? Aquí encontrarás las respuestas a las preguntas más comunes.
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card rounded-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <span className="text-lg font-bold text-slate-800 pr-8">{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-indigo-500 transition-transform duration-300 ${activeIndex === index ? "rotate-180" : ""}`}
                                />
                            </button>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-indigo-50/50">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 text-center glass-card p-10 rounded-3xl border border-indigo-100"
                >
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">¿No encuentras lo que buscas?</h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        Si tienes alguna otra pregunta o sugerencia, no dudes en contactar con nosotros.
                    </p>
                    <Link href="/contacto">
                        <span className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                            Ir a Contacto
                        </span>
                    </Link>
                </motion.div>

                {/* Direct Links FAQ - Chollos */}
                <div className="mt-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Chollos del día</div>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a href="https://otieu.com/4/10375901" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border-2 border-amber-100 bg-amber-50/30 shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-700 flex items-center justify-between group">
                            <span className="group-hover:text-amber-600 transition-colors">🔥 Ofertas Flash AliExpress</span>
                            <ExternalLink className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        </a>
                        <a href="https://otieu.com/4/10375902" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border-2 border-amber-100 bg-amber-50/30 shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-700 flex items-center justify-between group">
                            <span className="group-hover:text-amber-600 transition-colors">💎 Super Chollos HOY</span>
                            <ExternalLink className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div >
    );
}
