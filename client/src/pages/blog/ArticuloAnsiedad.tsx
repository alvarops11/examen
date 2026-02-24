import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Brain, Sparkles, Smile } from "lucide-react";
import { Link } from "wouter";

export default function ArticuloAnsiedad() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-white">
            <SEO
                title="Reducir la Ansiedad ante los Exámenes"
                description="Consejos científicos y herramientas de IA para ganar confianza y reducir el estrés antes de un examen importante."
                canonicalPath="/blog/reducir-ansiedad-examenes"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": "Venciendo el Miedo al Papel en Blanco: Ciencia y Tecnología",
                    "description": "Cómo el autotest frecuente con IA puede reducir drásticamente los niveles de cortisol y aumentar la confianza del estudiante.",
                    "author": {
                        "@type": "Organization",
                        "name": "ExamSphere"
                    },
                    "datePublished": "2026-02-24",
                    "image": "/blog/ansiedad-examenes.png"
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
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 inline-block">
                            Bienestar Estudiantil
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
                            Venciendo el Miedo al Papel en Blanco: Ciencia y Tecnología
                        </h1>
                    </motion.div>
                </div>

                <div className="max-w-5xl mx-auto px-4 mb-16">
                    <img
                        src="/blog/ansiedad-examenes.png"
                        alt="Estudiante relajada y preparada"
                        className="w-full aspect-[21/9] object-cover rounded-[2rem] shadow-2xl"
                    />
                </div>

                <div className="max-w-3xl mx-auto px-4 pb-24">
                    <div className="prose prose-emerald prose-lg max-w-none text-slate-700 leading-relaxed space-y-8">
                        <p>
                            La ansiedad ante los exámenes no es solo una sensación desagradable; es un fenómeno fisiológico que bloquea la recuperación de información de la memoria a largo plazo. Cuando el <strong>cortisol</strong> (la hormona del estrés) sube, el acceso a lo aprendido se vuelve más difícil.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 mt-12">La Exposición Progresiva como Solución</h2>
                        <p>
                            En psicología, una de las formas más efectivas de superar un miedo es la exposición gradual. Si te aterroriza el día del examen, la solución es "hacer muchos exámenes" antes.
                        </p>
                        <p>
                            Al utilizar ExamSphere para realizar autoevaluaciones diarias, le estás enseñando a tu cerebro que el formato examen es un entorno seguro y conocido. El cerebro deja de interpretar la prueba como una amenaza y empieza a verla como un reto técnico.
                        </p>

                        <div className="bg-emerald-50 rounded-[2.5rem] p-10 my-16 border border-emerald-100">
                            <h3 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                                <Smile className="text-emerald-600" />
                                Beneficios del Autotest
                            </h3>
                            <ul className="space-y-4 text-emerald-800">
                                <li><strong>• Familiaridad:</strong> Entrenar el formato reduce la sorpresa.</li>
                                <li><strong>• Control:</strong> Saber qué áreas dominas y cuáles no te da una sensación de mando sobre la situación.</li>
                                <li><strong>• Memoria:</strong> El esfuerzo de recordar bajo presión moderada fortalece la retención para la presión real.</li>
                            </ul>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">La Confianza basada en Datos</h2>
                        <p>
                            Muchas veces la ansiedad viene de la incertidumbre: "¿Sabré lo suficiente?". Al obtener tests aprobados con IA sobre tus propios apuntes, tienes una prueba tangible de tu competencia. Esa confianza basada en resultados reales es el mejor escudo contra los nervios.
                        </p>

                        <p>
                            Recuerda: ExamSphere es tu campo de entrenamiento. Aquí puedes fallar, aprender y volver a intentarlo tantas veces como necesites hasta que el día del examen oficial sea solo un paso más en tu camino al éxito.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
