import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

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
