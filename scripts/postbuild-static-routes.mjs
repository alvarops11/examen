import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.resolve("dist/public");
const INDEX_HTML = path.join(PUBLIC_DIR, "index.html");
const NOT_FOUND_HTML = path.join(PUBLIC_DIR, "404.html");

const STATIC_ROUTES = [
  "/",
  "/blog",
  "/blog/tecnicas-estudio",
  "/blog/ia-educacion",
  "/blog/preparar-oposiciones-ia",
  "/blog/reducir-ansiedad-examenes",
  "/blog/como-estudiar-temarios-largos",
  "/blog/errores-frecuentes-tipo-test",
  "/blog/organizar-semana-examenes",
  "/blog/como-tomar-mejores-apuntes",
  "/sobre-nosotros",
  "/como-usar",
  "/faq",
  "/contacto",
  "/aviso-legal",
  "/privacidad",
  "/cookies",
];

if (!existsSync(INDEX_HTML)) {
  throw new Error(`No se encontró ${INDEX_HTML}. Ejecuta primero vite build.`);
}

copyFileSync(INDEX_HTML, NOT_FOUND_HTML);

for (const route of STATIC_ROUTES) {
  if (route === "/") continue;
  const routeDir = path.join(PUBLIC_DIR, route.slice(1));
  mkdirSync(routeDir, { recursive: true });
  copyFileSync(INDEX_HTML, path.join(routeDir, "index.html"));
}

console.log(`Generadas rutas estáticas SEO: ${STATIC_ROUTES.length - 1}`);
