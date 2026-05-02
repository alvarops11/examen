import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, CheckCircle2, Brain, Target } from "lucide-react";
import { Link } from "wouter";

export default function ArticuloErroresTest() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-white">
            <SEO
                title="Errores frecuentes al estudiar con exámenes tipo test"
                description="Descubre los fallos más habituales al preparar exámenes tipo test y cómo corregirlos para transformar práctica en nota real."
                canonicalPath="/blog/errores-frecuentes-tipo-test"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    headline: "Errores frecuentes al estudiar con exámenes tipo test",
                    description: "Una guía para detectar hábitos que sabotean la preparación de exámenes tipo test y convertir el entrenamiento en aprendizaje real.",
                    author: {
                        "@type": "Organization",
                        name: "ExamSphere",
                    },
                    datePublished: "2026-04-29",
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
                        Errores frecuentes al estudiar con <span className="text-indigo-600">exámenes tipo test</span>
                    </motion.h1>
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                        <div>
                            <p className="text-slate-900 font-bold">Equipo Académico ExamSphere</p>
                            <p className="text-slate-500 text-sm">8 min de lectura • Actualizado en Abril 2026</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 mb-16">
                    <div className="aspect-[21/9] rounded-[2rem] shadow-2xl bg-gradient-to-br from-rose-500 via-orange-400 to-slate-900 text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
                        <div className="flex items-start justify-between gap-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/15">
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <span className="text-xs uppercase tracking-[0.3em] text-white/75">Aprender corrigiendo</span>
                        </div>
                        <div className="max-w-2xl">
                            <p className="text-3xl md:text-5xl font-black leading-tight text-balance">
                                Un test útil no solo mide: también te enseña dónde te estás engañando.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 pb-24">
                    <div className="prose prose-indigo prose-lg max-w-none text-slate-700 leading-relaxed space-y-8">
                        <p>
                            Hacer tests ayuda muchísimo, pero no cualquier uso del formato test produce aprendizaje. Muchos estudiantes practican decenas de preguntas y aun así sienten que no avanzan porque repiten hábitos que generan familiaridad, no comprensión.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 mt-12">Error 1: mirar solo la nota final</h2>
                        <p>
                            Quedarse con el he sacado un 7 es cómodo, pero no te dice casi nada. Lo que transforma el entrenamiento es detectar <strong>patrones de fallo</strong>: confusiones entre conceptos parecidos, errores por lectura rápida o puntos del temario que nunca consolidaste.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900">Error 2: repetir preguntas memorizadas</h2>
                        <p>
                            Cuando ya recuerdas la respuesta por familiaridad, el test deja de medir conocimiento y empieza a medir memoria del formato. Por eso conviene alternar preguntas nuevas, reformuladas o creadas desde distintos fragmentos del mismo contenido.
                        </p>

                        <div className="bg-amber-50 rounded-3xl p-8 my-10 border border-amber-100">
                            <h3 className="text-amber-900 font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Señal de alerta
                            </h3>
                            <p className="text-amber-800 text-sm">
                                Si aciertas una pregunta pero no puedes explicar por qué las demás opciones eran falsas, probablemente aún no dominas bien el concepto.
                            </p>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">Error 3: corregir deprisa y seguir</h2>
                        <p>
                            El valor de un test no está solo en responder, sino en cómo corriges. Las mejores mejoras suelen llegar cuando conviertes cada error en una explicación breve: qué confundiste, cuál era la pista correcta y qué señal deberías detectar la próxima vez.
                        </p>

                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><strong>Fácil:</strong> automatiza conceptos básicos y vocabulario.</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><strong>Media:</strong> consolida relaciones, clasificaciones y comparaciones.</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><strong>Alta:</strong> prepara las preguntas que separan una nota buena de una excelente.</span>
                            </li>
                        </ul>

                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white my-12">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-300" />
                                Cómo ayuda ExamSphere
                            </h3>
                            <p className="text-slate-300">
                                El valor de usar una herramienta como ExamSphere no es solo generar preguntas, sino poder variar dificultad, rehacer bloques concretos y convertir la corrección en feedback útil.
                            </p>
                        </div>

                        <p>
                            Los exámenes tipo test son potentes cuando te obligan a pensar, comparar y justificar. Si evitas estos errores, cada sesión deja de ser una mera comprobación y se convierte en una inversión directa en tu rendimiento.
                        </p>
                    </div>

                    <div className="mt-20 p-10 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                        <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Haz mejores tests, no solo más tests</h3>
                        <p className="text-slate-600 mb-8">Genera un simulacro nuevo y corrige con calma para detectar exactamente dónde estás perdiendo puntos.</p>
                        <Link href="/">
                            <span className="cursor-pointer inline-block bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                                Crear un simulacro
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
