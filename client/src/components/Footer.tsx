import { Link } from "wouter";

export default function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                                <img src="/logo.png" alt="ExamSphere Logo" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                ExamSphere
                            </h3>
                        </div>
                        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                            La plataforma definitiva para estudiantes que quieren optimizar su tiempo de estudio mediante inteligencia artificial de vanguardia.
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-4 text-sm uppercase tracking-wider">Explorar</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">Inicio</Link></li>
                            <li><Link href="/como-usar" className="text-slate-600 hover:text-indigo-600 transition-colors">Cómo Usar</Link></li>
                            <li><Link href="/faq" className="text-slate-600 hover:text-indigo-600 transition-colors">Preguntas Frecuentes</Link></li>
                            <li><Link href="/contacto" className="text-slate-600 hover:text-indigo-600 transition-colors">Contacto</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-4 text-sm uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/aviso-legal" className="text-slate-600 hover:text-indigo-600 transition-colors">Aviso Legal</Link></li>
                            <li><Link href="/privacidad" className="text-slate-600 hover:text-indigo-600 transition-colors">Política de Privacidad</Link></li>
                            <li><Link href="/cookies" className="text-slate-600 hover:text-indigo-600 transition-colors">Política de Cookies</Link></li>
                        </ul>
                    </div>

                    {/* Promoted */}
                    <div>
                        <h4 className="text-amber-600 font-black mb-4 text-sm uppercase tracking-wider">🔥 Chollos</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="https://otieu.com/4/10375892" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-600 transition-colors font-bold">AliExpress Ofertas</a></li>
                            <li><a href="https://otieu.com/4/10375903" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-600 transition-colors font-bold">Descuentos de HOY</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} ExamSphere. Herramienta educativa sin ánimo de lucro.
                    </p>
                    <p className="text-sm text-slate-400">
                        Potenciado por Inteligencia Artificial para el éxito académico.
                    </p>
                </div>
            </div>
        </footer>
    );
}
