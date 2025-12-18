import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Bug, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);

        try {
            // Endpoint real de Formspree
            const response = await fetch("https://formspree.io/f/mykggaoj", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                toast.success("Mensaje enviado correctamente. Te contactaremos pronto en soporteexamsphere@gmail.com.");
                (e.target as HTMLFormElement).reset();
            } else {
                toast.error("Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.");
            }
        } catch (error) {
            toast.error("Error de conexión. Por favor, comprueba tu internet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow max-w-6xl mx-auto px-4 py-16 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Ponte en <span className="text-gradient">Contacto</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Estamos aquí para ayudarte. ¿Has encontrado un error o tienes alguna sugerencia para mejorar la plataforma?
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Info cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card p-6 rounded-2xl flex gap-4 items-start"
                        >
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Email Directo</h4>
                                <p className="text-slate-500 text-sm mb-2">Escríbenos en cualquier momento</p>
                                <a href="mailto:soporteexamsphere@gmail.com" className="text-indigo-600 font-semibold hover:underline break-all block text-sm sm:text-base">
                                    soporteexamsphere@gmail.com
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card p-6 rounded-2xl flex gap-4 items-start"
                        >
                            <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-xl">
                                <Bug className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Reportar Fallo</h4>
                                <p className="text-slate-500 text-sm mb-2">Ayúdanos a mejorar corrigiendo errores</p>
                                <span className="text-fuchsia-600 font-semibold">Usa el formulario lateral</span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card p-6 rounded-2xl flex gap-4 items-start"
                        >
                            <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Sugerencias</h4>
                                <p className="text-slate-500 text-sm mb-2">¿Quieres alguna función nueva?</p>
                                <span className="text-violet-600 font-semibold">¡Queremos escucharte!</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-[100%] z-0" />

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Tu Nombre</label>
                                    <input
                                        required
                                        name="nombre"
                                        type="text"
                                        placeholder="Juan Pérez"
                                        className="w-full px-4 py-3 glass-input rounded-xl text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Tu Email</label>
                                    <input
                                        required
                                        name="email"
                                        type="email"
                                        placeholder="juan@ejemplo.com"
                                        className="w-full px-4 py-3 glass-input rounded-xl text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Asunto</label>
                                <select name="asunto" className="w-full px-4 py-3 glass-input rounded-xl text-slate-700 appearance-none bg-white/50">
                                    <option>Duda General</option>
                                    <option>Error en el Generador</option>
                                    <option>Sugerencia de Mejora</option>
                                    <option>Otro</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Mensaje</label>
                                <textarea
                                    required
                                    name="mensaje"
                                    rows={5}
                                    placeholder="Cuéntanos en qué podemos ayudarte..."
                                    className="w-full px-4 py-3 glass-input rounded-xl text-slate-700 resize-none"
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full btn-gradient py-4 text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Enviar Mensaje
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
