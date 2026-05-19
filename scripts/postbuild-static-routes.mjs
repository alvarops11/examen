import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.resolve("dist/public");
const INDEX_HTML = path.join(PUBLIC_DIR, "index.html");
const NOT_FOUND_HTML = path.join(PUBLIC_DIR, "404.html");
const BASE_URL = "https://examsphere.me";

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
  "/estadisticas",
  "/aviso-legal",
  "/privacidad",
  "/cookies",
];

if (!existsSync(INDEX_HTML)) {
  throw new Error(`No se encontro ${INDEX_HTML}. Ejecuta primero vite build.`);
}

const baseHtml = readFileSync(INDEX_HTML, "utf8");

function buildRouteHtml(route) {
  const normalizedRoute = route === "/" ? "/" : route.replace(/\/+$/, "");
  const absoluteUrl = `${BASE_URL}${normalizedRoute === "/" ? "" : normalizedRoute}`;

  let html = baseHtml;

  // Update OG URL so crawlers that do not execute JS still see route-level metadata.
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/>/i,
    `<meta property="og:url" content="${absoluteUrl}" />`
  );

  // Ensure route-level canonical exists in prerendered static HTML.
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href="[^"]*"\s*\/>/i,
      `<link rel="canonical" href="${absoluteUrl}" />`
    );
  } else {
    html = html.replace("</head>", `  <link rel="canonical" href="${absoluteUrl}" />\n</head>`);
  }

  // Keep analytics/stats page out of index even without client-side hydration.
  if (normalizedRoute === "/estadisticas") {
    html = html.replace(
      /<meta name="robots" content="[^"]*"\s*\/>/i,
      '<meta name="robots" content="noindex,follow,max-image-preview:large" />'
    );
  }

  return html;
}

const notFoundHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pagina no encontrada | ExamSphere</title>
  <meta name="robots" content="noindex,follow,max-image-preview:large" />
  <link rel="canonical" href="https://examsphere.me/404" />
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .card {
      max-width: 560px;
      width: 100%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      padding: 28px;
      text-align: center;
    }
    h1 { margin: 0 0 8px; font-size: 2rem; }
    p { margin: 0 0 20px; color: #475569; line-height: 1.5; }
    a {
      display: inline-block;
      text-decoration: none;
      background: #4f46e5;
      color: #fff;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>404</h1>
    <p>La pagina solicitada no existe o ha cambiado de ruta.</p>
    <a href="/">Volver al inicio</a>
  </main>
</body>
</html>
`;

writeFileSync(NOT_FOUND_HTML, notFoundHtml, "utf8");

for (const route of STATIC_ROUTES) {
  if (route === "/") continue;
  const routeDir = path.join(PUBLIC_DIR, route.slice(1));
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(path.join(routeDir, "index.html"), buildRouteHtml(route), "utf8");
}

console.log(`Generadas rutas estaticas SEO: ${STATIC_ROUTES.length - 1}`);
