import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Protection from "./pages/Protection";
import Pensions from "./pages/Pensions";
import HealthInsurance from "./pages/HealthInsurance";
import GeneralInsurance from "./pages/GeneralInsurance";

import Investments from "./pages/Investments";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfBusiness from "./pages/TermsOfBusiness";
import PhoneAuth from "./pages/PhoneAuth";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import VerifyEmail from "./pages/VerifyEmail";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/phone-auth" component={PhoneAuth} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/protection" component={Protection} />
      <Route path="/pensions" component={Pensions} />
      <Route path="/health-insurance" component={HealthInsurance} />
      <Route path="/general-insurance" component={GeneralInsurance} />

      <Route path="/investments" component={Investments} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms-of-business" component={TermsOfBusiness} />
      <Route path="/terms" component={TermsOfBusiness} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;