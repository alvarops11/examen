import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AvisoLegal from "./pages/AvisoLegal";
import Privacidad from "./pages/Privacidad";
import Cookies from "./pages/Cookies";

import HowToUse from "./pages/HowToUse";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Estadisticas from "./pages/Estadisticas";
import SobreNosotros from "./pages/SobreNosotros";
import Blog from "./pages/Blog";
import ArticuloTecnicas from "./pages/blog/ArticuloTecnicas";
import ArticuloIAEducacion from "./pages/blog/ArticuloIAEducacion";
import ArticuloOposiciones from "./pages/blog/ArticuloOposiciones";
import ArticuloAnsiedad from "./pages/blog/ArticuloAnsiedad";
import ArticuloTemariosLargos from "./pages/blog/ArticuloTemariosLargos";
import ArticuloErroresTest from "./pages/blog/ArticuloErroresTest";
import ArticuloPlanSemanal from "./pages/blog/ArticuloPlanSemanal";
import ArticuloApuntes from "./pages/blog/ArticuloApuntes";

/**
 * ExamSphere - Generador de Exámenes con IA
 * Diseño: Minimalismo Académico Moderno
 * - Tema claro (light) con azul académico como acento
 * - Tipografía: Playfair Display para títulos, Inter para cuerpo
 */

function Router() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <WouterRouter base={base}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/como-usar"} component={HowToUse} />
        <Route path={"/faq"} component={FAQ} />
        <Route path={"/contacto"} component={Contact} />
        <Route path={"/aviso-legal"} component={AvisoLegal} />
        <Route path={"/privacidad"} component={Privacidad} />
        <Route path={"/cookies"} component={Cookies} />
        <Route path={"/estadisticas"} component={Estadisticas} />
        <Route path={"/sobre-nosotros"} component={SobreNosotros} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/blog/tecnicas-estudio"} component={ArticuloTecnicas} />
        <Route path={"/blog/ia-educacion"} component={ArticuloIAEducacion} />
        <Route path={"/blog/preparar-oposiciones-ia"} component={ArticuloOposiciones} />
        <Route path={"/blog/reducir-ansiedad-examenes"} component={ArticuloAnsiedad} />
        <Route path={"/blog/como-estudiar-temarios-largos"} component={ArticuloTemariosLargos} />
        <Route path={"/blog/errores-frecuentes-tipo-test"} component={ArticuloErroresTest} />
        <Route path={"/blog/organizar-semana-examenes"} component={ArticuloPlanSemanal} />
        <Route path={"/blog/como-tomar-mejores-apuntes"} component={ArticuloApuntes} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
