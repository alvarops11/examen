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

/**
 * ExamSphere - Generador de Exámenes con IA
 * Diseño: Minimalismo Académico Moderno
 * - Tema claro (light) con azul académico como acento
 * - Tipografía: Playfair Display para títulos, Inter para cuerpo
 */

function Router() {
  // Use BASE_URL from vite config for consistent routing
  return (
    <WouterRouter base={import.meta.env.BASE_URL}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/como-usar"} component={HowToUse} />
        <Route path={"/faq"} component={FAQ} />
        <Route path={"/contacto"} component={Contact} />
        <Route path={"/aviso-legal"} component={AvisoLegal} />
        <Route path={"/privacidad"} component={Privacidad} />
        <Route path={"/cookies"} component={Cookies} />
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
