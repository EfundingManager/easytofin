import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Protection from "./pages/Protection";
import Pensions from "./pages/Pensions";
import HealthInsurance from "./pages/HealthInsurance";
import GeneralInsurance from "./pages/GeneralInsurance";
import Mortgages from "./pages/Mortgages";
import Investments from "./pages/Investments";
import About from "./pages/About";
import Contact from "./pages/Contact";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/protection" component={Protection} />
      <Route path="/pensions" component={Pensions} />
      <Route path="/health-insurance" component={HealthInsurance} />
      <Route path="/general-insurance" component={GeneralInsurance} />
      <Route path="/mortgages" component={Mortgages} />
      <Route path="/investments" component={Investments} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
