import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { BrainCircuit, Target, ShieldCheck, Heart } from "lucide-react";

export default function SobreNosotros() {
    const values = [
        {
            icon: <Target className="w-8 h-8" />,
            title: "Nuestra Misión",
            description: "Democratizar el acceso a herramientas de estudio avanzadas, permitiendo que cualquier estudiante pueda optimizar su tiempo y mejorar su rendimiento académico."
        },
        {
            icon: <BrainCircuit className="w-8 h-8" />,
            title: "Innovación con IA",
            description: "Utilizamos los modelos de inteligencia artificial más recientes para transformar material de estudio bruto en ejercicios pedagógicamente efectivos y personalizados."
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Ética y Responsabilidad",
            description: "Promovemos el uso responsable de la IA como un complemento al estudio profundo, no como un atajo, fomentando la comprensión real sobre la memorización."
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Compromiso Estudiantil",
            description: "Nacimos de la necesidad real de los estudiantes. Escuchamos vuestro feedback para evolucionar y ofrecer siempre la mejor experiencia gratuita."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col pt-0 bg-slate-50">
            <SEO
                title="Sobre Nosotros"
                description="Conoce la historia detrás de ExamSphere, nuestra misión de revolucionar el estudio con IA y nuestros valores fundamentales."
                canonicalPath="/sobre-nosotros"
            />
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-24 md:py-32 px-4 bg-slate-950 text-white overflow-hidden relative">
                    {/* Advanced Neural Mesh Background */}
                    <div className="absolute inset-0 z-0 opacity-40">
                        <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                </radialGradient>
                            </defs>

                            {/* Animated Connections */}
                            {[...Array(20)].map((_, i) => (
                                <motion.line
                                    key={`line-${i}`}
                                    x1={`${Math.random() * 100}%`}
                                    y1={`${Math.random() * 100}%`}
                                    x2={`${Math.random() * 100}%`}
                                    y2={`${Math.random() * 100}%`}
                                    stroke="rgba(129, 140, 248, 0.15)"
                                    strokeWidth="0.1"
                                    animate={{
                                        opacity: [0.1, 0.3, 0.1],
                                        strokeWidth: [0.05, 0.15, 0.05],
                                    }}
                                    transition={{
                                        duration: 3 + Math.random() * 5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}

                            {/* Floating Nodes */}
                            {[...Array(15)].map((_, i) => (
                                <motion.circle
                                    key={`node-${i}`}
                                    r="0.5"
                                    fill="url(#nodeGradient)"
                                    initial={{
                                        cx: `${Math.random() * 100}%`,
                                        cy: `${Math.random() * 100}%`
                                    }}
                                    animate={{
                                        cx: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                                        cy: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                                        opacity: [0.2, 0.6, 0.2]
                                    }}
                                    transition={{
                                        duration: 10 + Math.random() * 10,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />
                            ))}
                        </svg>

                        {/* Large Background Glows */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute top-0 -left-20 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]"
                        />
                    </div>

                    <div className="max-w-4xl mx-auto relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        >
                            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] lg:leading-[1]">
                                <span className="block text-slate-400 text-2xl md:text-3xl font-bold mb-4 tracking-widest uppercase">Nosotros somos</span>
                                Revolucionando el <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-300% animate-gradient">
                                    estudio con IA.
                                </span>
                            </h1>
                            <div className="h-1 w-24 bg-indigo-500 mx-auto mb-8 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto opacity-90">
                                ExamSphere no es solo código; es la convergencia entre la ciencia cognitiva y la IA generativa para el éxito académico.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto space-y-16">
                        {/* Story Card */}
                        <div className="glass-card rounded-[2.5rem] p-8 md:p-16 border border-indigo-100 shadow-2xl bg-white/80 backdrop-blur-xl">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b border-indigo-50 pb-4">Nuestra Historia y Visión</h2>
                            <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed text-lg">
                                <p>
                                    En el corazón de <strong>ExamSphere</strong> reside una verdad fundamental: el sistema educativo tradicional a menudo abruma a los estudiantes con una carga cognitiva que dificulta el aprendizaje real. La idea surgió al observar el potencial disruptivo de la <strong>inteligencia artificial generativa</strong> no como un sustituto del esfuerzo, sino como el motor más potente jamás creado para la autoevaluación.
                                </p>
                                <p>
                                    Fundada por apasionados de la tecnología educativa, nuestra plataforma nació para resolver un problema crítico: la creación manual de material de práctica es lenta y propensa a sesgos. Al integrar modelos de lenguaje avanzados (LLM), permitimos que cualquier estudiante transforme sus apuntes en un entorno de examen profesional en cuestión de segundos.
                                </p>
                                <p>
                                    Lo que comenzó como un proyecto de innovación académica para optimizar el <em>Active Recall</em>, ha evolucionado hacia una infraestructura robusta que procesa material complejo con una precisión quirúrgica, democratizando el acceso a las herramientas que antes estaban reservadas para entornos de aprendizaje de élite.
                                </p>
                            </div>
                        </div>

                        {/* Technology / SEO "Authority" Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all" />
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <BrainCircuit className="text-indigo-400" />
                                    Tecnología de Vanguardia
                                </h3>
                                <p className="text-slate-400 leading-relaxed mb-6">
                                    Utilizamos una arquitectura híbrida que combina el procesamiento de documentos local con la potencia de los modelos <strong>Gemini de Google</strong> a través de <strong>OpenRouter</strong>. Esto nos permite analizar la jerarquía semántica de tus apuntes, extrayendo no solo datos, sino conceptos interconectados.
                                </p>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Procesamiento de Lenguaje Natural (NLP) avanzado
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Algoritmos de ajuste de dificultad pedagógica
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Generación de feedback dinámico y explicaciones
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <Target className="text-indigo-600" />
                                    ¿Por qué elegir ExamSphere?
                                </h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    Si buscas la <strong>mejor herramienta de generación de exámenes con IA</strong>, ExamSphere destaca por su enfoque en la utilidad académica real. Mientras otras herramientas se limitan a resúmenes, nosotros nos enfocamos en el <em>output</em>: el examen que realmente te prepara para el éxito.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                                        <div className="font-bold text-indigo-600">01</div>
                                        <div className="text-sm text-slate-700"><strong>Precisión Semántica:</strong> Entendemos el contexto de tus apuntes técnicos, médicos o legales.</div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-violet-50/50 border border-violet-100/50">
                                        <div className="font-bold text-violet-600">02</div>
                                        <div className="text-sm text-slate-700"><strong>Privacidad Total:</strong> Tus datos se procesan de forma efímera, priorizando tu seguridad.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 px-4 bg-slate-100/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Nuestros Valores</h2>
                            <p className="text-slate-600 max-w-xl mx-auto">Los pilares que guían cada línea de código y cada decisión que tomamos.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((v, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                        {v.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">{v.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{v.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
