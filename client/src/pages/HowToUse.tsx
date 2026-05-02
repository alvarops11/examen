import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { BookOpen, Upload, Settings, CheckCircle, GraduationCap, ShieldCheck, TimerReset, FileDown, BrainCircuit } from "lucide-react";
import { Link } from "wouter";

export default function HowToUse() {
    const steps = [
        {
            icon: <Upload className="w-6 h-6" />,
            title: "1. Sube tu material",
            description: "Pega tus apuntes directamente en el área de texto o sube un archivo PDF o TXT. ExamSphere analizará el contenido para extraer los conceptos clave."
        },
        {
            icon: <Settings className="w-6 h-6" />,
            title: "2. Personaliza el examen",
            description: "Elige tu nivel académico (desde 1º hasta Máster), ajusta la dificultad y decide cuántas preguntas quieres generar (máximo 50)."
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: "3. Generación con IA",
            description: "Haz clic en 'Generar Examen'. Nuestra inteligencia artificial creará preguntas tipo test con cuatro opciones de respuesta y explicaciones detalladas."
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: "4. Realiza el test",
            description: "Responde a las preguntas a tu ritmo. Al finalizar, pulsa 'Corregir Examen' para ver tu puntuación y las respuestas correctas."
        },
        {
            icon: <GraduationCap className="w-6 h-6" />,
            title: "5. Aprende de tus errores",
            description: "Revisa las explicaciones de cada pregunta para entender por qué una respuesta es correcta, ayudándote a fijar conceptos de forma efectiva."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <SEO
                title="Cómo Usar"
                description="Aprende a generar exámenes con IA en segundos. Guía paso a paso para crear tus propios tests de estudio."
                canonicalPath="/como-usar"
            />
            <Header />

            <main className="flex-grow max-w-5xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Cómo usar <span className="text-gradient">ExamSphere</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Optimiza tu estudio en minutos. Sigue estos sencillos pasos para empezar a practicar con tus propios materiales.
                    </p>
                </motion.div>

                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-card rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 animate-float">
                                {step.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4">{step.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                            <BrainCircuit className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Que hace realmente ExamSphere</h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                ExamSphere no se limita a escribir preguntas sueltas. Convierte tus propios apuntes, PDFs o textos en un flujo completo de practica: generacion, realizacion, correccion y revision.
                            </p>
                            <p>
                                Puedes ajustar dificultad, numero de preguntas y contexto academico para que el simulacro se acerque mas a tu nivel real de estudio.
                            </p>
                            <p>
                                Despues del examen, la plataforma muestra correccion, nota final y explicaciones por pregunta para ayudarte a entender el fallo y no solo a contar aciertos.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Calidad, control y privacidad</h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                El sistema aplica validaciones internas para reducir preguntas incompletas, opciones invalidas o respuestas mal construidas antes de mostrar el examen al usuario.
                            </p>
                            <p>
                                Cuando el material es mas largo o complejo, ExamSphere reorganiza el contenido para mantener estabilidad y seguir generando simulacros utiles.
                            </p>
                            <p>
                                Ademas, el contenido de tus documentos se procesa para crear el examen, pero no se conserva como una biblioteca publica ni se reutiliza como material compartido entre usuarios.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-10 rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Todo lo que puedes hacer dentro del examen</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="rounded-3xl bg-white border border-slate-200 p-6">
                            <TimerReset className="w-8 h-8 text-indigo-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Temporizador integrado</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Realiza el simulacro con cronometro o temporizador para acercarte mas a una situacion de examen real.
                            </p>
                        </div>
                        <div className="rounded-3xl bg-white border border-slate-200 p-6">
                            <FileDown className="w-8 h-8 text-violet-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Descarga en PDF</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Puedes descargar tanto el examen normal como el PDF corregido para repasar despues o imprimirlo.
                            </p>
                        </div>
                        <div className="rounded-3xl bg-white border border-slate-200 p-6">
                            <GraduationCap className="w-8 h-8 text-emerald-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Revision explicada</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Cada pregunta corregida incluye explicacion para convertir el simulacro en aprendizaje y no solo en una nota final.
                            </p>
                        </div>
                    </div>
                </section>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-center"
                >
                    <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
                    <p className="mb-8 opacity-90 max-w-xl mx-auto">
                        No pierdas más tiempo creando tests manualmente. Deja que nuestra IA trabaje por ti.
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href="/">
                            <span className="cursor-pointer inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                                Crear mi primer examen
                            </span>
                        </Link>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
