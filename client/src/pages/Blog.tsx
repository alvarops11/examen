import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "wouter";
import {
    Clock,
    ArrowRight,
    Sparkles,
    Brain,
    Book,
    Heart,
    Layers3,
    AlertTriangle,
    CalendarRange,
    NotebookPen,
} from "lucide-react";

type BlogPost = {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    icon: ReactNode;
    color: string;
    image: string;
};

export default function Blog() {
    const posts: BlogPost[] = [
        {
            id: "tecnicas-estudio",
            title: "Dominando el Active Recall y la Repetición Espaciada",
            excerpt: "Descubre por qué estas dos técnicas son las más amadas por los estudiantes de medicina y cómo puedes aplicarlas con ExamSphere.",
            category: "Técnicas de Estudio",
            readTime: "8 min",
            image: "/blog/tecnicas-estudio.png",
            icon: <Brain className="w-5 h-5" />,
            color: "indigo",
        },
        {
            id: "ia-educacion",
            title: "El futuro de la educación: cómo la IA personaliza el aprendizaje",
            excerpt: "La inteligencia artificial no es solo para chatbots. Analizamos cómo está transformando la formación universitaria y el papel del estudiante.",
            category: "IA & Educación",
            readTime: "10 min",
            image: "/blog/ia-educacion.png",
            icon: <Sparkles className="w-5 h-5" />,
            color: "violet",
        },
        {
            id: "preparar-oposiciones-ia",
            title: "IA para opositores: el secreto para memorizar leyes y temarios",
            excerpt: "Si estás preparando una oposición, aquí tienes una forma más práctica de transformar material árido en entrenamiento útil.",
            category: "Oposiciones",
            readTime: "7 min",
            image: "/blog/oposiciones.png",
            icon: <Book className="w-5 h-5" />,
            color: "amber",
        },
        {
            id: "reducir-ansiedad-examenes",
            title: "Venciendo el miedo al papel en blanco con autotests",
            excerpt: "La ciencia demuestra que el test frecuente reduce la ansiedad. Aprende cómo ganar confianza antes del gran día.",
            category: "Bienestar",
            readTime: "6 min",
            image: "/blog/ansiedad-examenes.png",
            icon: <Heart className="w-5 h-5" />,
            color: "emerald",
        },
        {
            id: "como-estudiar-temarios-largos",
            title: "Cómo estudiar temarios largos sin perder el control",
            excerpt: "Aprende a dividir manuales y materiales densos en bloques útiles, priorizar con criterio y practicar sin sentir que el temario te supera.",
            category: "Productividad",
            readTime: "9 min",
            image: "/blog/temarios-largos.png",
            icon: <Layers3 className="w-5 h-5" />,
            color: "sky",
        },
        {
            id: "errores-frecuentes-tipo-test",
            title: "Errores frecuentes al estudiar con exámenes tipo test",
            excerpt: "No todos los tests enseñan igual. Descubre qué hábitos sabotean tu preparación y cómo convertir cada simulacro en aprendizaje real.",
            category: "Estrategia",
            readTime: "8 min",
            image: "/blog/errores-test.png",
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "rose",
        },
        {
            id: "organizar-semana-examenes",
            title: "Cómo organizar una semana de exámenes sin colapsar",
            excerpt: "Una guía clara para repartir repasos, simulacros y descansos cuando se juntan varios parciales o finales en pocos días.",
            category: "Planificación",
            readTime: "7 min",
            image: "/blog/semana-examenes.png",
            icon: <CalendarRange className="w-5 h-5" />,
            color: "teal",
        },
        {
            id: "como-tomar-mejores-apuntes",
            title: "Cómo tomar mejores apuntes en la universidad",
            excerpt: "Convierte notas caóticas en material claro, útil y perfecto para repasos activos, tests y simulacros con IA.",
            category: "Universidad",
            readTime: "8 min",
            image: "/blog/mejores-apuntes.png",
            icon: <NotebookPen className="w-5 h-5" />,
            color: "fuchsia",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col pt-0 bg-slate-50">
            <SEO
                title="Blog Educativo"
                description="Explora recursos, consejos de estudio y las últimas tendencias en IA aplicada a la educación en el blog de ExamSphere."
                canonicalPath="/blog"
            />
            <Header />

            <main className="flex-grow max-w-6xl mx-auto px-4 py-16">
                <header className="mb-16 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 mb-6"
                    >
                        Recursos y <span className="text-gradient">Aprendizaje</span>
                    </motion.h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Artículos profundos diseñados para ayudarte a estudiar de forma más inteligente, no más dura.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {posts.map((post, i) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group"
                        >
                            <Link href={`/blog/${post.id}`}>
                                <div className="glass-card rounded-[2rem] overflow-hidden border border-slate-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer bg-white">
                                    <div className="aspect-video overflow-hidden relative">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-${post.color}-600 shadow-sm flex items-center gap-2`}>
                                                {post.icon}
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {post.readTime} lectura
                                            </span>
                                            <span>•</span>
                                            <span>{new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</span>
                                        </div>

                                        <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {post.title}
                                        </h2>

                                        <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center text-indigo-600 font-bold text-sm">
                                            Leer artículo completo
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <section className="mt-24 p-12 md:p-16 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-3xl font-black mb-6">¿Quieres elevar tu promedio?</h3>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Recibe consejos prácticos de estudio y novedades del blog en tu correo. Sin spam y con enfoque directo en técnicas útiles para aprobar mejor.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-colors">
                                Quiero recibir novedades
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
