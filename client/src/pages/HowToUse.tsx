import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { BookOpen, Upload, Settings, CheckCircle, GraduationCap } from "lucide-react";
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
