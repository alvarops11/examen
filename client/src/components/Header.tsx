import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
    showExit?: boolean;
    onExit?: () => void;
}

export default function Header({ showExit, onExit }: HeaderProps) {
    const [location] = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Inicio" },
        { href: "/como-usar", label: "Cómo Usar" },
        { href: "/faq", label: "FAQ" },
        { href: "/contacto", label: "Contacto" },
    ];

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="sticky top-0 z-50 glass-card border-b border-indigo-100/50"
        >
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 cursor-pointer">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2 overflow-hidden hover:scale-105 transition-transform duration-300">
                        <img src="/examen/logo.png" alt="ExamSphere Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            ExamSphere
                        </h1>
                        <p className="text-[10px] md:text-xs text-slate-500 font-medium tracking-wide">AI POWERED LEARNING</p>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <span className={`text-sm font-semibold transition-colors cursor-pointer ${location === link.href ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
                                }`}>
                                {link.label}
                            </span>
                        </Link>
                    ))}
                    {showExit && onExit && (
                        <Button variant="ghost" size="sm" onClick={onExit} className="text-slate-600 hover:text-indigo-600 group">
                            <ArrowRight className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
                            Salir
                        </Button>
                    )}
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    {showExit && onExit && (
                        <Button variant="ghost" size="sm" onClick={onExit} className="text-slate-600 hover:text-indigo-600 p-2">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md:hidden border-t border-indigo-50 bg-white/95 backdrop-blur-md"
                >
                    <div className="flex flex-col p-4 gap-4">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                                <span
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text-base font-semibold transition-colors p-2 rounded-lg ${location === link.href ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                        }`}
                                >
                                    {link.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.header>
    );
}
