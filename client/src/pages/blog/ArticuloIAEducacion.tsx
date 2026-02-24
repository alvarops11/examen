import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Shield, Cpu } from "lucide-react";
import { Link } from "wouter";

export default function ArticuloIAEducacion() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-white">
            <SEO
                title="El Futuro de la Educación: Inteligencia Artificial Personalizada"
                description="Analizamos cómo la IA está transformando el aprendizaje universitario, la importancia de la ética y cómo los estudiantes pueden aprovechar estas herramientas."
                canonicalPath="/blog/ia-educacion"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": "¿Cómo la IA está personalizando el éxito académico?",
                    "description": "Un análisis sobre la transformación de la educación superior a través de la inteligencia artificial.",
                    "author": {
                        "@type": "Organization",
                        "name": "ExamSphere"
                    },
                    "datePublished": "2026-02-24",
                    "image": "/blog/ia-educacion.png"
                }}
            />
            <Header />

            <main className="flex-grow">
                {/* Article Header */}
                <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
                    <Link href="/blog">
                        <span className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm mb-8 hover:gap-3 transition-all cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Blog
                        </span>
                    </Link>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-bold mb-6 border border-violet-100 uppercase tracking-wider"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Futuro del Aprendizaje</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8"
                    >
                        ¿Cómo la IA está personalizando el éxito académico?
                    </motion.h1>
                    <p className="text-slate-500 font-medium">Por: Innovación Educativa ExamSphere • 10 min de lectura</p>
                </div>

                {/* Feature Image */}
                <div className="max-w-5xl mx-auto px-4 mb-16">
                    <img
                        src="/blog/ia-educacion.png"
                        alt="Inteligencia Artificial"
                        className="w-full aspect-[21/9] object-cover rounded-[2rem] shadow-2xl"
                    />
                </div>

                {/* Article Content */}
                <div className="max-w-3xl mx-auto px-4 pb-24">
                    <div className="prose prose-violet prose-lg max-w-none text-slate-700 leading-relaxed space-y-8">
                        <p>
                            Estamos viviendo la mayor disrupción en la historia de la educación desde la invención de la imprenta. La Inteligencia Artificial (IA) ha dejado de ser una promesa de ciencia ficción para convertirse en el tutor personalizado que cada estudiante siempre soñó tener.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 mt-12">Del Aula Estándar al Aprendizaje Adaptativo</h2>
                        <p>
                            El modelo educativo tradicional se basa en la "clase magistral": un profesor impartiendo el mismo contenido a cincuenta alumnos con diferentes ritmos, bases y motivaciones. La IA rompe este molde a través del <strong>Aprendizaje Adaptativo</strong>.
                        </p>
                        <p>
                            Herramientas como ExamSphere no solo generan preguntas; analizan el contenido proporcionado por el usuario para identificar los puntos críticos y presentarlos de forma que el cerebro del estudiante deba procesarlos activamente. Es una personalización que escala al infinito.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                <Zap className="w-8 h-8 text-violet-600 mb-4" />
                                <h3 className="font-bold text-slate-900 mb-2">Eficiencia Radical</h3>
                                <p className="text-sm text-slate-600">Lo que antes tardaba horas (crear tests, resumir, extraer conceptos), ahora sucede en segundos, liberando tiempo para el estudio profundo.</p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                <Cpu className="w-8 h-8 text-violet-600 mb-4" />
                                <h3 className="font-bold text-slate-900 mb-2">Tutoría 24/7</h3>
                                <p className="text-sm text-slate-600">La IA no duerme. Puedes generar un examen a las 3 AM antes de un parcial y obtener feedback inmediato.</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">El Elefante en la Habitación: Ética y Responsabilidad</h2>
                        <p>
                            Mucho se ha hablado sobre el riesgo de las "alucinaciones" de la IA o el uso de estas herramientas para evitar el esfuerzo intelectual. En ExamSphere, nuestra visión es clara: <strong>La IA es una brújula, no un GPS.</strong>
                        </p>
                        <p>
                            El valor real de usar IA en la educación surge cuando el estudiante utiliza la tecnología para retarse a sí mismo. Generar un examen sobre un temario que aún no has leído es inútil; generarlo después de una primera lectura para validar lo aprendido es lo que marca la diferencia entre un aprobado y una matrícula de honor.
                        </p>

                        <div className="bg-violet-900 rounded-[2.5rem] p-10 my-16 text-white relative overflow-hidden">
                            <Shield className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
                            <h3 className="text-2xl font-black mb-4 relative z-10">Nuestro Decálogo Ético</h3>
                            <ul className="space-y-4 relative z-10 opacity-90">
                                <li>• La IA asiste al pensamiento crítico, no lo reemplaza.</li>
                                <li>• Transparencia total sobre los modelos utilizados.</li>
                                <li>• Privacidad del usuario como pilar innegociable.</li>
                                <li>• Fomento del aprendizaje honesto y profundo.</li>
                            </ul>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">Hacia dónde vamos</h2>
                        <p>
                            En los próximos años, veremos una integración aún más profunda. La IA podrá predecir en qué temas vas a fallar antes de que hagas el examen basándose en patrones de aprendizaje previos. La educación dejará de ser reactiva para ser proactiva.
                        </p>
                        <p>
                            Estamos orgullosos de ser parte de esta transición, proporcionando a los estudiantes universitarios del mañana las herramientas que necesitan para sobrevivir y destacar en un mundo cada vez más complejo.
                        </p>

                        <blockquote className="text-2xl font-bold text-slate-900 italic text-center py-10 border-y border-slate-100 my-12">
                            "La educación no se trata de llenar un cubo, sino de encender un fuego. La IA es el fósforo más potente que hemos inventado jamás."
                        </blockquote>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
