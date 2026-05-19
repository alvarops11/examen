import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { fetchStats } from "@/lib/geminiService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import { Users, BookOpen, Calendar, TrendingUp, Sparkles, Loader2, Clock, Target, FileDown, Brain, Zap, UserPlus, Repeat2, BarChart3, UserCheck, MessageCircleQuestion, ThumbsUp, ThumbsDown } from "lucide-react";

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
    const uniqueVisitors = stats?.audience?.unique_total || 0;
    const totalNewVisitors = stats?.audience?.new?.total || 0;
    const totalReturningVisitors = stats?.audience?.returning?.total || 0;
    const todayNewVisitors = stats?.audience?.new?.today || 0;
    const todayReturningVisitors = stats?.audience?.returning?.today || 0;
    const visitsPerBrowser = uniqueVisitors > 0 ? (totalVisitas / uniqueVisitors).toFixed(1) : "0.0";
    const returnRate = uniqueVisitors > 0 ? ((totalReturningVisitors / uniqueVisitors) * 100).toFixed(1) : "0.0";
    const newExamTotal = stats?.examSegments?.new?.total || 0;
    const returningExamTotal = stats?.examSegments?.returning?.total || 0;
    const newConversion = totalNewVisitors > 0 ? ((newExamTotal / totalNewVisitors) * 100).toFixed(1) : "0.0";
    const returningConversion = totalReturningVisitors > 0 ? ((returningExamTotal / totalReturningVisitors) * 100).toFixed(1) : "0.0";
    const feedbackVotes = stats?.feedback?.total_votes || 0;
    const feedbackAverage = Number(stats?.feedback?.average_rating || 0).toFixed(1);
    const feedbackDistribution = [
        { score: 1, emoji: "😞", votes: stats?.feedback?.ratings?.[1] || 0 },
        { score: 2, emoji: "🙁", votes: stats?.feedback?.ratings?.[2] || 0 },
        { score: 3, emoji: "😐", votes: stats?.feedback?.ratings?.[3] || 0 },
        { score: 4, emoji: "🙂", votes: stats?.feedback?.ratings?.[4] || 0 },
        { score: 5, emoji: "🤩", votes: stats?.feedback?.ratings?.[5] || 0 },
    ];
    const tutorOpens = stats?.tutor?.opens || 0;
    const tutorMessages = stats?.tutor?.messages || 0;
    const tutorLimitReached = stats?.tutor?.limit_reached || 0;
    const tutorUniqueUsers = stats?.tutor?.unique_users || 0;
    const tutorUniqueMessageUsers = stats?.tutor?.unique_message_users || 0;
    const tutorYesVotes = stats?.tutor?.feedback?.yes || 0;
    const tutorNoVotes = stats?.tutor?.feedback?.no || 0;
    const tutorFeedbackVotes = tutorYesVotes + tutorNoVotes;
    const tutorApprovalRate = tutorFeedbackVotes > 0 ? ((tutorYesVotes / tutorFeedbackVotes) * 100).toFixed(1) : "0.0";
    const tutorUsageRate = uniqueVisitors > 0 ? ((tutorUniqueUsers / uniqueVisitors) * 100).toFixed(1) : "0.0";
    const tutorAvgMessages = tutorUniqueMessageUsers > 0 ? (tutorMessages / tutorUniqueMessageUsers).toFixed(1) : "0.0";
    const tutorFeedbackData = [
        { label: "Sí", value: tutorYesVotes, icon: ThumbsUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "No", value: tutorNoVotes, icon: ThumbsDown, color: "text-rose-600", bg: "bg-rose-50" },
    ];
    const examTypeStats = {
        multipleChoice: {
            today: stats?.examTypes?.multiple_choice?.today || 0,
            month: stats?.examTypes?.multiple_choice?.month || 0,
            total: stats?.examTypes?.multiple_choice?.total || 0,
        },
        trueFalse: {
            today: stats?.examTypes?.true_false?.today || 0,
            month: stats?.examTypes?.true_false?.month || 0,
            total: stats?.examTypes?.true_false?.total || 0,
        },
    };

    const mainStats = [
        { label: "Conversion Rate", value: `${conversionRate}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Visitas que generan examen" },
        { label: "Tiempo Medio", value: `${avgGenTime}s`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", desc: "Velocidad de respuesta IA" },
        { label: "Media Preguntas", value: avgQuestions, icon: Brain, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Longitud media de exámenes" },
        { label: "Total Exámenes", value: totalExamenes.toLocaleString(), icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", desc: "Generados históricamente" },
    ];

    const audienceStats = [
        { label: "Usuarios nuevos", value: totalNewVisitors.toLocaleString(), icon: UserPlus, color: "text-sky-600", bg: "bg-sky-50", desc: `${todayNewVisitors} hoy` },
        { label: "Visitas recurrentes", value: totalReturningVisitors.toLocaleString(), icon: Repeat2, color: "text-violet-600", bg: "bg-violet-50", desc: `${todayReturningVisitors} hoy` },
        { label: "Navegadores únicos", value: uniqueVisitors.toLocaleString(), icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Identificados con localStorage" },
        { label: "Frecuencia de retorno", value: `${returnRate}%`, icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50", desc: `${visitsPerBrowser} visitas por navegador` },
    ];

    const conversionByAudience = [
        { name: "Nuevas", visitors: totalNewVisitors, exams: newExamTotal, conversion: newConversion, color: "bg-sky-500" },
        { name: "Recurrentes", visitors: totalReturningVisitors, exams: returningExamTotal, conversion: returningConversion, color: "bg-violet-500" },
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
    const modelPerformanceRows = Array.isArray(stats?.modelPerformance) ? stats.modelPerformance : [];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <SEO
                title="Estadísticas de Uso"
                description="Métricas en tiempo real sobre el uso de nuestra IA: exámenes generados, niveles académicos y más."
                canonicalPath="/estadisticas"
                noindex
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {audienceStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + (i * 0.08) }}
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
                                        transition={{ duration: 1, delay: 0.7 + (i * 0.08) }}
                                        className={`h-full ${stat.color.replace('text-', 'bg-')}`}
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

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Conteo por tipo de examen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-3xl bg-slate-50 p-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Tipo Test</div>
                            <div className="mt-2 text-3xl font-black text-slate-900">{examTypeStats.multipleChoice.total.toLocaleString()}</div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-500">Hoy:</span> <span className="font-bold text-slate-900">{examTypeStats.multipleChoice.today}</span></div>
                                <div><span className="text-slate-500">Mes:</span> <span className="font-bold text-slate-900">{examTypeStats.multipleChoice.month}</span></div>
                            </div>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Verdadero/Falso</div>
                            <div className="mt-2 text-3xl font-black text-slate-900">{examTypeStats.trueFalse.total.toLocaleString()}</div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-500">Hoy:</span> <span className="font-bold text-slate-900">{examTypeStats.trueFalse.today}</span></div>
                                <div><span className="text-slate-500">Mes:</span> <span className="font-bold text-slate-900">{examTypeStats.trueFalse.month}</span></div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Conversión por tipo de visita
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {conversionByAudience.map((segment) => (
                            <div key={segment.name} className="rounded-3xl bg-slate-50 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{segment.name}</div>
                                        <div className="text-3xl font-black text-slate-900 mt-1">{segment.conversion}%</div>
                                    </div>
                                    <div className={`h-12 w-12 rounded-2xl ${segment.color} text-white flex items-center justify-center shadow-lg`}>
                                        <Target className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Visitantes del segmento</span>
                                        <span className="font-bold text-slate-900">{segment.visitors.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Exámenes generados</span>
                                        <span className="font-bold text-slate-900">{segment.exams.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(Number(segment.conversion), 100)}%` }}
                                            transition={{ duration: 1 }}
                                            className={`h-full ${segment.color}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12 overflow-x-auto"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Rendimiento por modelo
                    </h3>
                    <table className="w-full min-w-[760px] border border-slate-200 rounded-md overflow-hidden">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="text-left text-xs font-bold uppercase tracking-wide text-slate-600 px-3 py-2 border-b border-r border-slate-200">Model</th>
                                <th className="text-right text-xs font-bold uppercase tracking-wide text-slate-600 px-3 py-2 border-b border-r border-slate-200">successRate</th>
                                <th className="text-right text-xs font-bold uppercase tracking-wide text-slate-600 px-3 py-2 border-b border-r border-slate-200">avgLatency (ms)</th>
                                <th className="text-right text-xs font-bold uppercase tracking-wide text-slate-600 px-3 py-2 border-b border-r border-slate-200">timeoutRate</th>
                                <th className="text-right text-xs font-bold uppercase tracking-wide text-slate-600 px-3 py-2 border-b border-r border-slate-200">fallbackRate</th>
                                <th className="text-right text-xs font-bold uppercase tracking-wide text-slate-600 px-3 py-2 border-b border-slate-200">parseFailureRate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modelPerformanceRows.map((row: any) => (
                                <tr key={row.model} className="odd:bg-white even:bg-slate-50">
                                    <td className="px-3 py-2 text-sm text-slate-800 border-b border-r border-slate-200">{row.model}</td>
                                    <td className="px-3 py-2 text-sm text-slate-800 text-right border-b border-r border-slate-200">{Number(row.successRate || 0).toFixed(1)}%</td>
                                    <td className="px-3 py-2 text-sm text-slate-800 text-right border-b border-r border-slate-200">{Number(row.avgLatency || 0).toFixed(0)}</td>
                                    <td className="px-3 py-2 text-sm text-slate-800 text-right border-b border-r border-slate-200">{Number(row.timeoutRate || 0).toFixed(1)}%</td>
                                    <td className="px-3 py-2 text-sm text-slate-800 text-right border-b border-r border-slate-200">{Number(row.fallbackRate || 0).toFixed(1)}%</td>
                                    <td className="px-3 py-2 text-sm text-slate-800 text-right border-b border-slate-200">{Number(row.parseFailureRate || 0).toFixed(1)}%</td>
                                </tr>
                            ))}
                            {modelPerformanceRows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-3 py-4 text-sm text-slate-500 text-center">Sin datos de modelos todavía.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            Valoración de los exámenes
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-3xl bg-indigo-50 p-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-indigo-500">Media</div>
                                <div className="mt-2 text-4xl font-black text-slate-900">{feedbackAverage}</div>
                                <div className="mt-2 text-sm text-slate-500">Sobre 5 puntos</div>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Votos</div>
                                <div className="mt-2 text-4xl font-black text-slate-900">{feedbackVotes}</div>
                                <div className="mt-2 text-sm text-slate-500">Valoraciones recibidas</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Reparto de valoraciones
                        </h3>
                        <div className="space-y-4">
                            {feedbackDistribution.map((item) => {
                                const percentage = feedbackVotes > 0 ? (item.votes / feedbackVotes) * 100 : 0;
                                return (
                                    <div key={item.score}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.emoji}</span>
                                                <span className="text-sm font-bold text-slate-700">{item.score}/5</span>
                                            </div>
                                            <span className="text-sm font-black text-indigo-600">{item.votes}</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.9 }}
                                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <MessageCircleQuestion className="w-5 h-5 text-indigo-600" />
                            Tutor de errores
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-3xl bg-indigo-50 p-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-indigo-500">Usuarios</div>
                                <div className="mt-2 text-4xl font-black text-slate-900">{tutorUniqueUsers}</div>
                                <div className="mt-2 text-sm text-slate-500">{tutorUsageRate}% de navegadores únicos</div>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Consultas</div>
                                <div className="mt-2 text-4xl font-black text-slate-900">{tutorMessages}</div>
                                <div className="mt-2 text-sm text-slate-500">{tutorAvgMessages} de media por usuario que pregunta</div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Aperturas del tutor</span>
                                    <span className="font-bold text-slate-900">{tutorOpens}</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(tutorUniqueUsers > 0 ? (tutorOpens / Math.max(tutorUniqueUsers, 1)) * 35 : 0, 100)}%` }}
                                        transition={{ duration: 0.9 }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Usuarios que preguntan</span>
                                    <span className="font-bold text-slate-900">{tutorUniqueMessageUsers}</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(tutorUniqueUsers > 0 ? (tutorUniqueMessageUsers / tutorUniqueUsers) * 100 : 0, 100)}%` }}
                                        transition={{ duration: 0.9 }}
                                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Límite de prueba alcanzado</span>
                                    <span className="font-bold text-slate-900">{tutorLimitReached}</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(tutorUniqueUsers > 0 ? (tutorLimitReached / tutorUniqueUsers) * 100 : 0, 100)}%` }}
                                        transition={{ duration: 0.9 }}
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Encuesta del modo prueba
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-3xl bg-indigo-50 p-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-indigo-500">Aceptación</div>
                                <div className="mt-2 text-4xl font-black text-slate-900">{tutorApprovalRate}%</div>
                                <div className="mt-2 text-sm text-slate-500">Porcentaje de respuestas positivas</div>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Votos</div>
                                <div className="mt-2 text-4xl font-black text-slate-900">{tutorFeedbackVotes}</div>
                                <div className="mt-2 text-sm text-slate-500">Feedback enviado al agotar la prueba</div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {tutorFeedbackData.map((item) => (
                                <div key={item.label} className={`rounded-3xl p-5 ${item.bg}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
                                            <div className="mt-2 text-3xl font-black text-slate-900">{item.value}</div>
                                        </div>
                                        <div className={`rounded-2xl p-3 ${item.color} bg-white`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
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
