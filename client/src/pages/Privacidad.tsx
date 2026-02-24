import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getMailLink } from "@/lib/utils";

export default function Privacidad() {
    return (
        <div className="min-h-screen flex flex-col pt-0 bg-slate-50">
            <SEO
                title="Política de Privacidad"
                description="Tu privacidad es nuestra prioridad. Descubre cómo protegemos tus datos y qué información (no) recopilamos."
                canonicalPath="/privacidad"
            />
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-16 flex-grow">

                <div className="glass-card rounded-2xl p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8 text-gradient">
                        Política de Privacidad
                    </h1>

                    <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                1. Información General
                            </h2>
                            <p>
                                En cumplimiento del Reglamento General de Protección de Datos (RGPD) UE 2016/679 y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), ExamSphere informa sobre su política de privacidad.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                2. Responsable del Tratamiento
                            </h2>
                            <p>
                                <strong>ExamSphere</strong> es una aplicación web de código abierto desarrollada con fines educativos. Al no recopilar datos personales en servidores externos, no existe un responsable del tratamiento de datos en el sentido tradicional del RGPD.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                3. Datos que NO Recopilamos
                            </h2>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                <p className="font-semibold text-green-900 mb-3">
                                    ✅ ExamSphere NO recopila, almacena ni procesa ningún dato personal en servidores externos:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-green-800">
                                    <li>No solicitamos registro ni creación de cuentas</li>
                                    <li>No recopilamos nombres, emails ni datos de contacto</li>
                                    <li>No almacenamos direcciones IP ni información de navegación</li>
                                    <li>No utilizamos cookies de seguimiento o analíticas</li>
                                    <li>No compartimos datos con terceros (porque no los tenemos)</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                4. Almacenamiento Local (LocalStorage)
                            </h2>
                            <p>
                                ExamSphere utiliza <strong>localStorage</strong> del navegador para guardar información <strong>únicamente en tu dispositivo</strong>:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Preferencias de usuario:</strong> Configuraciones de la aplicación (tema, idioma, etc.)</li>
                                <li><strong>Aceptación de cookies:</strong> Estado de tu consentimiento de cookies</li>
                            </ul>
                            <p className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                                <strong>💡 Importante:</strong> Esta información se almacena SÓLO en tu navegador. Tú tienes el control total y puedes eliminarla en cualquier momento borrando los datos del sitio desde la configuración de tu navegador.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                5. Uso de Servicios de Terceros
                            </h2>
                            <p>
                                ExamSphere se conecta con los siguientes servicios externos:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Cloudflare Workers:</strong> Servicio de edge computing que ejecuta nuestro backend de forma segura. La API key de OpenRouter se almacena de forma segura en el worker, nunca en tu navegador.
                                </li>
                                <li>
                                    <strong>OpenRouter API:</strong> Servicio que proporciona acceso a modelos de IA. Cuando generas un examen, tu temario se envía a nuestro Cloudflare Worker, que luego lo procesa con OpenRouter. Consulta la{" "}
                                    <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                        política de privacidad de OpenRouter
                                    </a>.
                                </li>

                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                6. Tus Derechos (RGPD)
                            </h2>
                            <p>
                                Aunque ExamSphere no procesa datos personales, tienes derecho a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Acceso:</strong> Puedes ver los datos almacenados localmente en tu navegador (Herramientas de desarrollador → Application → Local Storage)</li>
                                <li><strong>Supresión:</strong> Puedes borrar todos los datos locales desde la configuración de tu navegador</li>
                                <li><strong>Portabilidad:</strong> Puedes exportar tus datos locales si lo necesitas</li>
                                <li><strong>Oposición:</strong> Puedes rechazar el uso de localStorage (aunque afectará la funcionalidad de la app)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                7. Seguridad
                            </h2>
                            <p>
                                Al no almacenar datos en servidores, la seguridad de tu información depende de:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>La seguridad de tu dispositivo y navegador</li>
                                <li>La seguridad de Cloudflare Workers, donde se almacena la API key de forma segura</li>
                                <li>El uso de HTTPS para todas las comunicaciones</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                8. Menores de Edad
                            </h2>
                            <p>
                                ExamSphere puede ser utilizada por menores de edad bajo supervisión de adultos. Al no recopilar datos personales, no aplicamos restricciones específicas, pero recomendamos que los menores de 14 años la utilicen con supervisión parental.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                9. Cambios en la Política de Privacidad
                            </h2>
                            <p>
                                Nos reservamos el derecho de modificar esta política de privacidad. Cualquier cambio será publicado en esta página con fecha de actualización.
                            </p>
                        </section>



                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                                11. Contacto
                            </h2>
                            <p>
                                Para cualquier duda sobre privacidad, puedes contactar con nosotros a través de nuestro correo electrónico oficial: <a href={getMailLink("soporteexamsphere@gmail.com")} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-bold">soporteexamsphere@gmail.com</a>
                            </p>
                        </section>

                        <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-slate-200">
                            Última actualización: Febrero 2026
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
