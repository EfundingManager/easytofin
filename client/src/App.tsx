import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { WeComWidgetSimple } from "./components/WeComWidgetSimple";
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
import AuthSelection from "./pages/AuthSelection";
import EmailAuth from "./pages/EmailAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCustomerDetail from "./pages/AdminCustomerDetail";
import UserProfile from "./pages/UserProfile";
import VerifyEmail from "./pages/VerifyEmail";
import FactFindingForm from "./pages/FactFindingForm";
import UserDashboard from "./pages/UserDashboard";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import UserPortal from "./pages/UserPortal";
import CustomerPortal from "./pages/CustomerPortal";
import ClientLoginComingSoon from "./pages/ClientLoginComingSoon";
import SignUp from "./pages/SignUp";
import VerifyEmailToken from "./pages/VerifyEmailToken";
import VerifyEmailPending from "./pages/VerifyEmailPending";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordEmail from "./pages/ResetPasswordEmail";
import ClientDashboard from "./pages/ClientDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import SupportDashboard from "./pages/SupportDashboard";
import TeamPage from "./pages/TeamPage";
import EmailBlasterPage from "./pages/EmailBlasterPage";
import UserManagement from "./pages/UserManagement";
import GmailConfirmation from "./pages/GmailConfirmation";
import Gmail2FAVerification from "./pages/Gmail2FAVerification";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth-selection" component={AuthSelection} />
      <Route path="/phone-auth" component={PhoneAuth} />
      <Route path="/email-auth" component={EmailAuth} />
      <Route path="/signup" component={SignUp} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/verify-email-pending" component={VerifyEmailPending} />
      <Route path="/verify-email/:token" component={VerifyEmailToken} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/reset-password-email" component={ResetPasswordEmail} />
      <Route path="/fact-finding" component={FactFindingForm} />
      <Route path="/fact-finding/:product" component={FactFindingForm} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/client-dashboard" component={ClientDashboard} />
      <Route path="/user/:userId" component={UserPortal} />
      <Route path="/customer/:customerId" component={CustomerPortal} />
      <Route path="/user-portal" component={UserPortal} />
      <Route path="/customer-portal" component={CustomerPortal} />
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
      <Route path="/2fa" component={TwoFactorAuth} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/customers/:customerId" component={AdminCustomerDetail} />
      <Route path="/super-admin" component={SuperAdminDashboard} />
      <Route path="/manager" component={ManagerDashboard} />
      <Route path="/support" component={SupportDashboard} />
      <Route path="/team" component={TeamPage} />
      <Route path="/email-blaster" component={EmailBlasterPage} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/gmail-confirmation" component={GmailConfirmation} />
      <Route path="/gmail-2fa" component={Gmail2FAVerification} />
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
            <WeComWidgetSimple />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
