import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function AvisoLegal() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen pb-20 bg-slate-50">
            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <Button
                    variant="ghost"
                    onClick={() => setLocation("/")}
                    className="mb-8 text-slate-600 hover:text-indigo-600 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Volver
                </Button>

                <div className="glass-card rounded-2xl p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8 text-gradient">
                        Aviso Legal
                    </h1>

                    <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                1. Datos Identificativos
                            </h2>
                            <p>
                                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa de los siguientes datos:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Denominación:</strong> ExamSphere</li>
                                <li><strong>Dominio:</strong> https://alvarops11.github.io/examen/</li>
                                <li><strong>Actividad:</strong> Plataforma educativa de generación de exámenes mediante inteligencia artificial</li>
                                <li><strong>Finalidad:</strong> Herramienta académica sin ánimo de lucro para estudiantes</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                2. Objeto
                            </h2>
                            <p>
                                ExamSphere es una aplicación web gratuita que permite a estudiantes generar exámenes tipo test a partir de material de estudio mediante tecnología de inteligencia artificial.
                            </p>
                            <p>
                                El uso de esta plataforma implica la aceptación plena de todas las condiciones aquí establecidas.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                3. Condiciones de Uso
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>El servicio utiliza inteligencia artificial para generar contenido educativo</li>
                                <li>No se garantiza la disponibilidad continua del servicio</li>
                                <li>El contenido generado se proporciona "tal cual", sin garantías de exactitud o precisión</li>
                                <li>ExamSphere no almacena ni procesa datos personales del usuario en servidores externos</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                4. Propiedad Intelectual
                            </h2>
                            <p>
                                Todos los contenidos, diseños, código fuente, logotipos y elementos gráficos de ExamSphere están protegidos por derechos de propiedad intelectual.
                            </p>
                            <p>
                                Este proyecto es de código abierto y se distribuye bajo licencia que permite su uso educativo. El código fuente está disponible en GitHub.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                5. Limitación de Responsabilidad
                            </h2>
                            <p>
                                ExamSphere no se hace responsable de:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>La exactitud, veracidad o actualización del contenido generado por la IA</li>
                                <li>Los resultados académicos derivados del uso de exámenes generados</li>
                                <li>Interrupciones del servicio por causas técnicas o de terceros</li>
                                <li>Daños derivados del uso inadecuado de la plataforma</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                6. Modificaciones
                            </h2>
                            <p>
                                ExamSphere se reserva el derecho de modificar este aviso legal en cualquier momento. Los cambios serán efectivos desde su publicación en la web.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                7. Legislación Aplicable
                            </h2>
                            <p>
                                Este aviso legal se rige por la legislación española vigente. Para cualquier controversia será de aplicación la legislación española, sometiéndose las partes a los Juzgados y Tribunales del domicilio del usuario.
                            </p>
                        </section>

                        <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-slate-200">
                            Última actualización: Diciembre 2024
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
