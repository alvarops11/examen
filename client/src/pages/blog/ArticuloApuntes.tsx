import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowLeft, NotebookPen, Brain, CheckCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function ArticuloApuntes() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-white">
            <SEO
                title="Cómo tomar mejores apuntes en la universidad"
                description="Ideas prácticas para crear apuntes más claros, útiles y listos para convertirse en tests, repasos y simulacros."
                canonicalPath="/blog/como-tomar-mejores-apuntes"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    headline: "Cómo tomar mejores apuntes en la universidad",
                    description: "Consejos para transformar apuntes caóticos en materiales claros, repasables y preparados para la autoevaluación.",
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
                        Cómo tomar <span className="text-indigo-600">mejores apuntes</span> en la universidad
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
                    <div className="aspect-[21/9] rounded-[2rem] shadow-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-slate-900 text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
                        <div className="flex items-start justify-between gap-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/15">
                                <NotebookPen className="w-7 h-7" />
                            </div>
                            <span className="text-xs uppercase tracking-[0.3em] text-white/75">Apuntes que sirven</span>
                        </div>
                        <div className="max-w-2xl">
                            <p className="text-3xl md:text-5xl font-black leading-tight text-balance">
                                Tus apuntes deberían ayudarte a estudiar mejor, no a perder tiempo ordenándolos.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 pb-24">
                    <div className="prose prose-violet prose-lg max-w-none text-slate-700 leading-relaxed space-y-8">
                        <p>
                            Unos apuntes buenos no son los más bonitos ni los más largos. Son los que, semanas después, te permiten entender rápido qué importa, qué depende de qué y qué preguntas podrían aparecer en un examen real.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 mt-12">Apunta para volver, no para presumir</h2>
                        <p>
                            El objetivo de tomar apuntes no es registrar cada palabra del profesor, sino crear un material reutilizable. Si al releerlos todo parece igual de importante, entonces no estás priorizando: solo estás copiando.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900">Estructura mínima que sí marca la diferencia</h2>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <CheckCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span>Título claro del tema o subtema.</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span>Definiciones separadas de ejemplos.</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span>Comparaciones o diferencias visibles.</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span>Una conclusión breve o idea fuerza al final.</span>
                            </li>
                        </ul>

                        <div className="bg-violet-50 rounded-3xl p-8 my-10 border border-violet-100">
                            <h3 className="text-violet-900 font-bold mb-4 flex items-center gap-2">
                                <NotebookPen className="w-5 h-5" />
                                Regla práctica
                            </h3>
                            <p className="text-violet-800 text-sm">
                                Si una idea importante no cabe en una frase clara dentro de tus apuntes, probablemente todavía no la entiendes lo suficiente o te falta separar conceptos.
                            </p>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">Cómo encajan con ExamSphere</h2>
                        <p>
                            Cuanto más claros son tus apuntes, mejores preguntas genera la herramienta. No porque haga magia, sino porque le estás dando un material mejor estructurado: conceptos definidos, relaciones claras y menos ruido inútil.
                        </p>

                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white my-12">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-violet-300" />
                                La idea clave
                            </h3>
                            <p className="text-slate-300">
                                Unos apuntes bien construidos son el puente entre la clase y la práctica. Si ese puente es sólido, el estudio activo después cuesta menos y rinde mucho más.
                            </p>
                        </div>

                        <p>
                            Tomar mejores apuntes no es una cuestión estética. Es una decisión estratégica que condiciona todo lo demás: cuánto tardas en repasar, qué calidad tienen tus preguntas y cuánta claridad tienes cuando se acerca el examen.
                        </p>
                    </div>

                    <div className="mt-20 p-10 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                        <Sparkles className="w-12 h-12 text-violet-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Convierte tus apuntes en práctica</h3>
                        <p className="text-slate-600 mb-8">Sube un bloque de tus notas y comprueba cómo cambia la calidad del test cuando el material está más claro.</p>
                        <Link href="/">
                            <span className="cursor-pointer inline-block bg-violet-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-violet-700 transition-all shadow-xl shadow-violet-100">
                                Crear preguntas con mis apuntes
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
