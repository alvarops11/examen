import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarRange, Clock3, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function ArticuloPlanSemanal() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-white">
            <SEO
                title="Cómo organizar una semana de exámenes sin colapsar"
                description="Una estrategia práctica para repartir repasos, tests y descansos cuando se acercan varios exámenes a la vez."
                canonicalPath="/blog/organizar-semana-examenes"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    headline: "Cómo organizar una semana de exámenes sin colapsar",
                    description: "Planifica repasos, simulacros y descansos de forma realista para llegar con claridad a una semana de parciales o finales.",
                    author: {
                        "@type": "Organization",
                        name: "ExamSphere",
                    },
                    datePublished: "2026-04-29",
                    image: "/blog/semana-examenes.png",
                }}
            />
            <Header />

            <main className="flex-grow">
                <div className="max-w-4xl mx-auto px-4 pt-16 pb-8">
                    <Link href="/blog">
                        <span className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm mb-8 hover:gap-3 transition-all cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Blog
                        </span>
                    </Link>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
                        Cómo organizar una <span className="text-indigo-600">semana de exámenes</span> sin colapsar
                    </motion.h1>
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                        <div>
                            <p className="text-slate-900 font-bold">Equipo Académico ExamSphere</p>
                            <p className="text-slate-500 text-sm">7 min de lectura • Actualizado en Abril 2026</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 mb-16">
                    <img
                        src="/blog/semana-examenes.png"
                        alt="Estudiante organizando una semana de exámenes"
                        className="w-full aspect-[21/9] object-cover rounded-[2rem] shadow-2xl"
                    />
                </div>

                <div className="max-w-3xl mx-auto px-4 pb-24">
                    <div className="prose prose-indigo prose-lg max-w-none text-slate-700 leading-relaxed space-y-8">
                        <p>
                            Cuando se juntan varios exámenes en pocos días, el error más común es reaccionar con pánico. Se intenta estudiar todo a la vez, se alargan las jornadas sin estructura y al final el cansancio decide por ti. Una semana exigente no se gana con heroicidades, sino con diseño.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 mt-12">Empieza por el mapa completo</h2>
                        <p>
                            Antes de abrir apuntes, necesitas una visión general: fechas, peso de cada examen, nivel de preparación actual y temas más débiles. Solo con ese mapa puedes decidir qué necesita simulacro, qué requiere repaso breve y qué ya está listo para mantenimiento.
                        </p>

                        <div className="bg-indigo-50 rounded-3xl p-8 my-10 border border-indigo-100">
                            <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                                <CalendarRange className="w-5 h-5" />
                                Orden recomendado
                            </h3>
                            <p className="text-indigo-800 text-sm">
                                Organiza la semana por prioridad académica y por cercanía temporal. Si dos exámenes están igual de cerca, decide por el que tenga más incertidumbre.
                            </p>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">Reserva bloques con función concreta</h2>
                        <p>
                            Una sesión genérica de estudio es demasiado vaga. Cada bloque debería tener una misión: repasar un tema, hacer 20 preguntas, corregir errores del simulacro anterior o memorizar una clasificación concreta.
                        </p>

                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><strong>Lunes-martes:</strong> detección de puntos débiles con tests cortos.</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><strong>Mitad de semana:</strong> repaso activo y consolidación.</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><strong>Últimos días:</strong> simulacro más largo, corrección y descanso inteligente.</span>
                            </li>
                        </ul>

                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white my-12">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Clock3 className="w-5 h-5 text-indigo-300" />
                                Regla de energía
                            </h3>
                            <p className="text-slate-300">
                                Coloca lo más exigente en tus horas de mayor claridad mental. Lo que requiere atención sostenida va primero; la corrección ligera o revisión complementaria puede ir después.
                            </p>
                        </div>

                        <p>
                            Una semana de exámenes bien organizada no se siente perfecta: se siente clara. Y esa claridad es la que protege tu energía cuando más la necesitas.
                        </p>
                    </div>

                    <div className="mt-20 p-10 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                        <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Convierte el plan en práctica</h3>
                        <p className="text-slate-600 mb-8">Prepara un bloque de estudio y genera un test corto para medir si lo que has repasado ya está asentado.</p>
                        <Link href="/">
                            <span className="cursor-pointer inline-block bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                                Probar con mis apuntes
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
