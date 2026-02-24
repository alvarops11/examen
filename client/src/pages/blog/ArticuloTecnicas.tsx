import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle, Lightbulb, Brain } from "lucide-react";
import { Link } from "wouter";

export default function ArticuloTecnicas() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-white">
            <SEO
                title="Técnicas de Estudio: Active Recall y Repetición Espaciada"
                description="Aprende cómo el Active Recall y la Repetición Espaciada pueden transformar tu rendimiento académico. Guía detallada con ejemplos prácticos."
                canonicalPath="/blog/tecnicas-estudio"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": "Dominando el Active Recall y la Repetición Espaciada",
                    "description": "Una guía detallada sobre las técnicas de estudio más efectivas basadas en la ciencia del aprendizaje.",
                    "author": {
                        "@type": "Organization",
                        "name": "ExamSphere"
                    },
                    "datePublished": "2026-02-24",
                    "image": "/blog/tecnicas-estudio.png"
                }}
            />
            <Header />

            <main className="flex-grow">
                {/* Article Header */}
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
                        Dominando el <span className="text-indigo-600">Active Recall</span> y la Repetición Espaciada
                    </motion.h1>
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                        <div>
                            <p className="text-slate-900 font-bold">Equipo Académico ExamSphere</p>
                            <p className="text-slate-500 text-sm">8 min de lectura • Actualizado en Febrero 2026</p>
                        </div>
                    </div>
                </div>

                {/* Feature Image */}
                <div className="max-w-5xl mx-auto px-4 mb-16">
                    <img
                        src="/blog/tecnicas-estudio.png"
                        alt="Estudiante concentrado"
                        className="w-full aspect-[21/9] object-cover rounded-[2rem] shadow-2xl"
                    />
                </div>

                {/* Article Content */}
                <div className="max-w-3xl mx-auto px-4 pb-24">
                    <div className="prose prose-indigo prose-lg max-w-none text-slate-700 leading-relaxed space-y-8">
                        <p className="text-xl font-medium text-slate-900 leading-relaxed italic border-l-4 border-indigo-500 pl-6">
                            "La mayoría de los estudiantes fallan no por falta de capacidad, sino por utilizar métodos de estudio ineficientes que crean una ilusión de competencia."
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 mt-12">¿Qué es el Active Recall?</h2>
                        <p>
                            El <strong>Active Recall</strong> (o Recuerdo Activo) es una estrategia de aprendizaje que consiste en poner a prueba tu memoria durante el proceso de estudio. En lugar de leer pasivamente tus apuntes una y otra vez, el Active Recall te obliga a recuperar información de tu cerebro.
                        </p>
                        <p>
                            Cuando intentas responder a una pregunta sin mirar el material, tu cerebro fortalece las conexiones neuronales asociadas con esa información. Es, literalmente, "ejercicio" para tu mente.
                        </p>

                        <div className="bg-indigo-50 rounded-3xl p-8 my-10 border border-indigo-100">
                            <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                Dato Científico
                            </h3>
                            <p className="text-indigo-800 text-sm">
                                Un estudio de 2011 publicado en la revista <em>Science</em> demostró que los estudiantes que practicaron Active Recall recordaron un 50% más de información que aquellos que utilizaron métodos de lectura pasiva o creación de mapas conceptuales.
                            </p>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900">La Curva del Olvido y la Repetición Espaciada</h2>
                        <p>
                            A finales del siglo XIX, Hermann Ebbinghaus descubrió la "Curva del Olvido". Notó que perdemos la mayor parte de la información que aprendemos en las primeras 24 horas si no la repasamos.
                        </p>
                        <p>
                            La <strong>Repetición Espaciada</strong> es el antídoto contra el olvido. Consiste en revisar el mismo material en intervalos de tiempo cada vez mayores (por ejemplo: 1 día después, 3 días después, 1 semana, 1 mes). Al repasar justo antes de que estés a punto de olvidar, "reseteas" la curva y la información pasa a la memoria a largo plazo.
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900">Cómo aplicar estas técnicas con ExamSphere</h2>
                        <p>
                            Automatizar estas técnicas puede ser complicado si lo haces de forma analógica. Por eso diseñamos ExamSphere:
                        </p>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><strong>Generación de Test:</strong> Al convertir tus apuntes en preguntas, te obligas a practicar Active Recall puro. Cada pregunta es un desafío para tu memoria.</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><strong>Feedback Inmediato:</strong> La corrección automática de ExamSphere te dice al instante qué sabes y qué no, evitando la "falsa sensación de conocimiento".</span>
                            </li>
                            <li className="flex gap-4">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span><span><strong>Explicaciones Detalladas:</strong> No solo te mostramos la respuesta correcta, sino el *porqué*, lo cual es vital para el aprendizaje asociativo.</span></span>
                            </li>
                        </ul>

                        <h2 className="text-3xl font-bold text-slate-900 mt-12">Conclusión</h2>
                        <p>
                            Estudiar más horas no siempre significa mejores notas. Al cambiar la lectura pasiva por el Recuerdo Activo y gestionar tus repasos con Repetición Espaciada, puedes reducir drásticamente tu tiempo de estudio mientras aumentas tu retención.
                        </p>
                        <p>
                            En ExamSphere estamos comprometidos con estas metodologías científicas para que tu éxito académico sea una consecuencia directa de tu eficiencia.
                        </p>
                    </div>

                    <div className="mt-20 p-10 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                        <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">¿Quieres ponerlo en práctica?</h3>
                        <p className="text-slate-600 mb-8">Sube tus apuntes ahora mismo y deja que nuestra IA cree tu primer entrenamiento cerebral.</p>
                        <Link href="/">
                            <span className="cursor-pointer inline-block bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                                Subir mis apuntes
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
