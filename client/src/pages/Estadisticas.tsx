import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { fetchStats } from "@/lib/geminiService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import { Users, BookOpen, Calendar, TrendingUp, Sparkles, Loader2, Clock, Target, FileDown, Brain, Zap } from "lucide-react";

export default function Estadisticas() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchStats();
                setStats(data);
            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    // Cálculos de métricas avanzadas
    const totalVisitas = stats?.visitors?.total || 1;
    const totalExamenes = stats?.exams?.total || 0;
    const conversionRate = Math.min((totalExamenes / totalVisitas) * 100, 100).toFixed(1);

    const totalGenTime = stats?.technical?.total_gen_time || 0;
    const avgGenTime = totalExamenes > 0 ? (totalGenTime / (totalExamenes * 1000)).toFixed(1) : "0.0";

    const totalQuestions = stats?.technical?.total_questions || 0;
    const avgQuestions = totalExamenes > 0 ? (totalQuestions / totalExamenes).toFixed(1) : "0";

    const mainStats = [
        { label: "Conversion Rate", value: `${conversionRate}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Visitas que generan examen" },
        { label: "Tiempo Medio", value: `${avgGenTime}s`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", desc: "Velocidad de respuesta IA" },
        { label: "Media Preguntas", value: avgQuestions, icon: Brain, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Longitud media de exámenes" },
        { label: "Total Exámenes", value: totalExamenes.toLocaleString(), icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", desc: "Generados históricamente" },
    ];

    const timeStats = [
        {
            title: "Visitantes",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            data: [
                { label: "Hoy", value: stats?.visitors?.today || 0 },
                { label: "Este Mes", value: stats?.visitors?.month || 0 },
                { label: "Total", value: stats?.visitors?.total || 0 },
            ]
        },
        {
            title: "Exámenes",
            icon: BookOpen,
            color: "text-purple-600",
            bg: "bg-purple-50",
            data: [
                { label: "Hoy", value: stats?.exams?.today || 0 },
                { label: "Este Mes", value: stats?.exams?.month || 0 },
                { label: "Total", value: stats?.exams?.total || 0 },
            ]
        }
    ];

    const difficultyData = [
        { name: 'Fácil', value: stats?.difficulties?.facil || 0, color: '#10b981' },
        { name: 'Media', value: stats?.difficulties?.media || 0, color: '#6366f1' },
        { name: 'Difícil', value: stats?.difficulties?.dificil || 0, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const courseData = Object.entries(stats?.courses || {}).map(([name, value]) => ({
        name,
        value: value as number
    })).filter(c => c.value > 0);

    const eventData = [
        { name: 'PDF Normal', value: stats?.events?.pdf_normal || 0 },
        { name: 'PDF Corregido', value: stats?.events?.pdf_corrected || 0 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <SEO
                title="Estadísticas de Uso"
                description="Métricas en tiempo real sobre el uso de nuestra IA: exámenes generados, niveles académicos y más."
                canonicalPath="/estadisticas"
            />
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
                        <Zap className="w-3 h-3" />
                        Live Analytics
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Panel Avanzado</h1>
                    <p className="text-slate-600">Métricas profundas sobre el comportamiento y uso de la IA.</p>
                </motion.div>

                {/* Highlight Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {mainStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-6 border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-400">{stat.label}</p>
                                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                        className={`h-full ${stat.bg.replace('bg-', 'bg-').split('-')[1] === '50' ? stat.color.replace('text-', 'bg-') : 'bg-indigo-500'}`}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">{stat.desc}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Time-based Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {timeStats.map((section, idx) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                        >
                            <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${section.bg} ${section.color}`}>
                                    <section.icon className="w-5 h-5" />
                                </div>
                                Resumen de {section.title}
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {section.data.map((item) => (
                                    <div key={item.label} className="text-center group">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">
                                            {item.label}
                                        </div>
                                        <div className="text-2xl font-black text-slate-900">
                                            {item.value.toLocaleString()}
                                        </div>
                                        <div className="mt-2 h-1.5 w-8 bg-slate-100 rounded-full mx-auto overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                className={`h-full ${section.color.replace('text-', 'bg-')}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Difficulty Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Nivel de Dificultad
                        </h3>
                        <div className="flex-grow flex items-center justify-center relative h-[250px]">
                            {difficultyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={difficultyData}
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {difficultyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-slate-400 text-sm">Sin datos suficientes</p>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-slate-900">{difficultyData.length}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Niveles</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-6">
                            {difficultyData.map(d => (
                                <div key={d.name} className="text-center">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{d.name}</div>
                                    <div className="text-sm font-bold text-slate-900">{((d.value / totalExamenes) * 100).toFixed(0)}%</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Academic Levels Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            Distribución Académica
                        </h3>
                        <div className="h-[300px] w-full">
                            {courseData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={courseData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontWeight: 600, fontSize: 12 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={32}>
                                            {courseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">Sin datos de cursos</div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Secondary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* PDF Downloads */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <FileDown className="w-5 h-5 text-indigo-600" />
                            Descargas de PDF
                        </h3>
                        <div className="space-y-4">
                            {eventData.map((event, i) => {
                                const totalEvents = eventData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                                const percentage = (event.value / totalEvents) * 100;
                                return (
                                    <div key={event.name} className="relative">
                                        <div className="flex justify-between items-center mb-2 z-10 relative">
                                            <span className="text-sm font-bold text-slate-700">{event.name}</span>
                                            <span className="text-sm font-black text-indigo-600">{event.value}</span>
                                        </div>
                                        <div className="h-10 w-full bg-slate-50 rounded-2xl overflow-hidden relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, delay: i * 0.2 }}
                                                className="h-full bg-indigo-500/10 border-r-2 border-indigo-500"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400">
                                                {percentage.toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>

                    {/* AI Response Time Trend (Simulated with total but could be real if tracked daily) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-600" />
                                Velocidad de Respuesta
                            </h3>
                            <div className="text-2xl font-black text-amber-600">{avgGenTime}s</div>
                        </div>
                        <div className="h-[140px] w-full bg-amber-50/50 rounded-3xl flex items-center justify-center overflow-hidden relative">
                            <Sparkles className="w-12 h-12 text-amber-200 absolute -right-4 -top-4 rotate-12" />
                            <div className="text-center px-12">
                                <p className="text-sm font-medium text-slate-600 mb-2">La IA generó <b>{totalQuestions}</b> preguntas en un tiempo total de <b>{(totalGenTime / 1000).toFixed(0)}s</b></p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                    <Zap className="w-3 h-3" />
                                    Optimizado para velocidad
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
