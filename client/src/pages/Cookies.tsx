import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Cookies() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-slate-50">
            <SEO
                title="Política de Cookies"
                description="Información sobre el uso de cookies y almacenamiento local en ExamSphere."
                canonicalPath="/cookies"
            />
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-16 flex-grow">

                <div className="glass-card rounded-2xl p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8 text-gradient">
                        Política de Cookies
                    </h1>

                    <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                1. ¿Qué son las Cookies?
                            </h2>
                            <p>
                                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas una página web. Permiten que el sitio web recuerde información sobre tu visita.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                2. Cookies que Utilizamos
                            </h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <p className="font-semibold text-blue-900 mb-3">
                                    🍪 ExamSphere utiliza ÚNICAMENTE almacenamiento local (localStorage):
                                </p>
                                <p className="text-blue-800">
                                    Técnicamente, <strong>no utilizamos cookies tradicionales</strong>, sino <strong>localStorage</strong> del navegador, que funciona de manera similar pero está diseñado para almacenamiento local persistente.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                3. Datos Almacenados Localmente
                            </h2>
                            <p>
                                ExamSphere almacena la siguiente información en tu navegador mediante localStorage:
                            </p>

                            <div className="space-y-4 mt-4">
                                <div className="border border-slate-200 rounded-xl p-4">
                                    <h3 className="font-bold text-slate-900 mb-2">cookiesAccepted</h3>
                                    <ul className="text-sm space-y-1">
                                        <li><strong>Propósito:</strong> Recordar tu consentimiento de cookies</li>
                                        <li><strong>Tipo:</strong> Técnica/Necesaria</li>
                                        <li><strong>Duración:</strong> Permanente (hasta que borres datos del navegador)</li>
                                        <li><strong>Datos:</strong> "true" o "false"</li>
                                    </ul>
                                </div>

                                <div className="border border-slate-200 rounded-xl p-4">
                                    <h3 className="font-bold text-slate-900 mb-2">Preferencias de Usuario</h3>
                                    <ul className="text-sm space-y-1">
                                        <li><strong>Propósito:</strong> Recordar configuraciones (tema, idioma, etc.)</li>
                                        <li><strong>Tipo:</strong> Funcional</li>
                                        <li><strong>Duración:</strong> Permanente (hasta que borres datos del navegador)</li>
                                        <li><strong>Datos:</strong> Preferencias de configuración</li>
                                    </ul>
                                </div>
                            </div>
                        </section>



                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                5. Cookies que NO Utilizamos
                            </h2>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                <p className="font-semibold text-green-900 mb-3">
                                    ✅ ExamSphere NO utiliza:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-green-800">
                                    <li><strong>Cookies de analítica propia:</strong> No rastreamos tu comportamiento internamente.</li>
                                    <li><strong>Cookies de redes sociales:</strong> No integramos botones sociales que rastreen.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                5. Finalidad del Almacenamiento Local
                            </h2>
                            <p>
                                El almacenamiento local se utiliza exclusivamente para:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Funcionamiento técnico:</strong> Mantener la funcionalidad básica de la aplicación</li>
                                <li><strong>Comodidad del usuario:</strong> Recordar tus preferencias y configuraciones</li>
                                <li><strong>Cumplimiento legal:</strong> Recordar tu consentimiento sobre cookies</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                6. Base Legal
                            </h2>
                            <p>
                                Las cookies técnicas y funcionales están exentas de consentimiento según el considerando 66 del RGPD y el artículo 22.2 de la LSSI, ya que son estrictamente necesarias para la prestación del servicio solicitado por el usuario.
                            </p>
                            <p>
                                No obstante, ExamSphere muestra un banner informativo cumpliendo con las mejores prácticas de transparencia.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                7. Gestionar o Eliminar Datos Almacenados
                            </h2>
                            <p>
                                Puedes eliminar todos los datos almacenados localmente en cualquier momento:
                            </p>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-4">
                                <h3 className="font-bold text-slate-900 mb-3">En Google Chrome / Edge:</h3>
                                <ol className="list-decimal pl-6 space-y-1 text-sm">
                                    <li>Abre la configuración (⚙️)</li>
                                    <li>Ve a "Privacidad y seguridad"</li>
                                    <li>Haz clic en "Borrar datos de navegación"</li>
                                    <li>Selecciona "Cookies y otros datos de sitios"</li>
                                    <li>Elige el rango de tiempo y confirma</li>
                                </ol>

                                <h3 className="font-bold text-slate-900 mb-3 mt-6">En Firefox:</h3>
                                <ol className="list-decimal pl-6 space-y-1 text-sm">
                                    <li>Abre el menú (☰)</li>
                                    <li>Ve a "Configuración" → "Privacidad y seguridad"</li>
                                    <li>En "Cookies y datos del sitio", haz clic en "Limpiar datos"</li>
                                    <li>Marca "Cookies y datos del sitio"</li>
                                    <li>Haz clic en "Limpiar"</li>
                                </ol>

                                <h3 className="font-bold text-slate-900 mb-3 mt-6">En Safari:</h3>
                                <ol className="list-decimal pl-6 space-y-1 text-sm">
                                    <li>Ve a "Preferencias" → "Privacidad"</li>
                                    <li>Haz clic en "Gestionar datos de sitios web"</li>
                                    <li>Busca "examsphere.me" y elimínalo</li>
                                </ol>
                            </div>

                            <p className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                                <strong>⚠️ Nota:</strong> Si eliminas el localStorage, perderás tu API key guardada y tendrás que volver a introducirla.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                8. Navegación Privada
                            </h2>
                            <p>
                                Si utilizas el modo incógnito/privado de tu navegador:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Los datos de localStorage se eliminarán automáticamente al cerrar la ventana</li>
                                <li>No se guardará tu consentimiento de cookies</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                9. Actualizaciones
                            </h2>
                            <p>
                                Esta política de cookies puede actualizarse periódicamente. Te recomendamos revisarla ocasionalmente. Los cambios serán efectivos desde su publicación.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                10. Más Información
                            </h2>
                            <p>
                                Para más información sobre cookies, puedes consultar:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Española de Protección de Datos (AEPD)</a></li>
                                <li><a href="https://www.aboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">AllAboutCookies.org</a></li>
                            </ul>
                        </section>

                        <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-slate-200">
                            Última actualización: Diciembre 2024
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
