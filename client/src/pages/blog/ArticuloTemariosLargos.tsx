import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Layers3, TimerReset, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function ArticuloTemariosLargos() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-white">
            <SEO
                title="Cómo estudiar temarios largos sin perder el control"
                description="Una guía práctica para dividir temarios extensos, priorizar contenidos y convertir bloques densos en sesiones de estudio sostenibles."
                canonicalPath="/blog/como-estudiar-temarios-largos"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": "Cómo estudiar temarios largos sin perder el control",
                    "description": "Estrategias realistas para abordar apuntes extensos, leyes, manuales universitarios y materiales densos con más claridad.",
                    "author": {
                        "@type": "Organization",
                        "name": "ExamSphere"
                    },
                    "datePublished": "2026-04-29",
                    "image": "/blog/oposiciones.png"
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
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8"
                    >
                        Cómo estudiar <span className="text-indigo-600">temarios largos</span> sin perder el control
                    </motion.h1>
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                        <div>
                            <p className="text-slate-900 font-bold">Equipo Académico ExamSphere</p>
                            <p className="text-slate-500 text-sm">9 min de lectura • Actualizado en Abril 2026</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 mb-16">
                    <img
                        src="/blog/oposiciones.png"
                        alt="Temarios largos organizados"
                        className="w-full aspect-[21/9] object-cover rounded-[2rem] shadow-2xl"
                    />
                </div>

                <div className="max-w-3xl mx-auto px-4 pb-24">
                    <div className="prose prose-indigo prose-lg max-w-none text-slate-700 leading-relaxed space-y-8">
                        <p>
                            Hay materiales que abruman solo con verlos: manuales universitarios, oposiciones, códigos comentados o asignaturas con cientos de páginas. El problema no es solo la cantidad. Lo que desgasta es la sensación de no saber por dónde empezar ni cómo medir el avance real.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 mt-12">Divide por decisiones, no por páginas</h2>
                        <p>
                            Una estrategia habitual es partir el temario cada 20 o 30 páginas. Eso puede ayudar, pero a veces mezcla conceptos distintos en el mismo bloque. Funciona mejor dividir por <strong>unidades de decisión</strong>: tema, epígrafe o pregunta probable de examen.
                        </p>
                        <p>
                            Cuando cada bloque responde a una cuestión clara, estudiar deja de sentirse infinito. Ya no estás “con el tema 4”, sino resolviendo algo concreto: una definición, una clasificación, un procedimiento o una comparación.
                        </p>

                        <div className="bg-indigo-50 rounded-3xl p-8 my-10 border border-indigo-100">
                            <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                                <Layers3 className="w-5 h-5" />
                                Regla útil
                            </h3>
                            <p className="text-indigo-800 text-sm">
                                Si un bloque no puedes resumirlo en una frase, seguramente todavía es demasiado grande. Reduce el alcance hasta que tenga una función clara dentro del examen.
                            </p>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">Prioriza por rendimiento, no por culpa</h2>
                        <p>
                            No todos los apartados pesan lo mismo. Antes de lanzarte a leerlo todo de forma lineal, identifica qué temas suelen caer más, qué conceptos arrastran otros y qué bloques podrías consolidar rápido con práctica.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900">Convierte la lectura en práctica cuanto antes</h2>
                        <p>
                            En temarios largos, leer mucho tiempo seguido da una falsa sensación de trabajo. Por eso conviene introducir recuperación activa muy pronto: preguntas, esquemas cerrados, mini tests o repaso oral.
                        </p>
                        <p>
                            ExamSphere encaja especialmente bien aquí porque te permite transformar un bloque denso en preguntas accionables. Eso ayuda a detectar si realmente entendiste el tema o solo lo reconoces al verlo.
                        </p>

                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white my-12">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <TimerReset className="w-5 h-5 text-indigo-300" />
                                Secuencia recomendada
                            </h3>
                            <p className="text-slate-300">
                                Lectura inicial breve, resumen corto, test inmediato, corrección y repaso a 24 horas. Esa secuencia reduce la fatiga y aumenta mucho la retención.
                            </p>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">Conclusión</h2>
                        <p>
                            Estudiar temarios largos no va de apretar más, sino de tomar mejores decisiones. Cuando organizas por bloques útiles, priorizas con criterio y conviertes pronto el contenido en práctica, el volumen deja de ser una amenaza difusa y se convierte en un proceso manejable.
                        </p>
                    </div>

                    <div className="mt-20 p-10 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                        <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Pon orden al siguiente bloque</h3>
                        <p className="text-slate-600 mb-8">Sube una parte de tu temario y conviértela en preguntas prácticas para empezar a medir progreso real.</p>
                        <Link href="/">
                            <span className="cursor-pointer inline-block bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                                Empezar ahora
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
