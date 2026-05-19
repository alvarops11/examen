# Cambios AdSense Fase 3 (HTML semantico inicial)

Fecha: 2026-05-19

## Objetivo

Mejorar deteccion de calidad/estructura en analizadores que inspeccionan HTML inicial sin ejecutar JS.

## Archivos modificados

- `client/index.html`
- `client/src/main.tsx`

## Cambios aplicados

1. Bloque SEO semantico inicial en `index.html`
- Se anadio contenido HTML con:
  - `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
  - H1 principal y H2 secundarios
  - texto informativo sustancial sobre el producto
  - enlaces internos clave (blog, legales, contacto, sobre nosotros)
  - formulario de busqueda basico
  - imagen con `alt`
  - referencias de confianza (autoría, contacto, legales, redes sociales)

2. Ocultacion automatica tras montar React
- Se anadio clase `app-mounted` en `main.tsx`.
- El CSS del fallback oculta el bloque semantico cuando la SPA ya esta activa.

## Riesgos / limitaciones

- Este bloque mejora lectura de checkers basicos, pero no sustituye la validacion real de Search Console y politicas de AdSense.
- Se mantiene contenido duplicado conceptual entre fallback y SPA, aunque solo queda visible en ausencia de montaje.

## Como probar

1. Cargar la web con JS activo:
- Debe verse la SPA normal.

2. Ver codigo fuente (`Ctrl+U`):
- Deben aparecer etiquetas semanticas, H1, enlaces internos y texto.

3. Comprobar que checkers HTML-first detectan:
- estructura semantica
- H1
- enlaces internos
- contenido suficiente
- enlaces legales y contacto
