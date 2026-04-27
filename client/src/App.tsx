import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { WeComWidgetSimple } from "./components/WeComWidgetSimple";
import { useState, useCallback } from "react";
import { useSessionTimeout } from "@/_core/hooks/useSessionTimeout";
import { SessionTimeoutWarning } from "./components/SessionTimeoutWarning";
import { useAuth } from "@/_core/hooks/useAuth";
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
import ManagerDashboard from "./pages/ManagerDashboard";
import SupportDashboard from "./pages/SupportDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import UserProfile from "./pages/UserProfile";
import VerifyEmail from "./pages/VerifyEmail";
import FactFindingForm from "./pages/FactFindingForm";
import UserDashboard from "./pages/UserDashboard";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import UserPortal from "./pages/UserPortal";
import CustomerPortal from "./pages/CustomerPortal";
import ClientLoginComingSoon from "./pages/ClientLoginComingSoon";
import UserLanding from "./pages/UserLanding";
import CustomerLanding from "./pages/CustomerLanding";
import AccountLockoutManagement from "./pages/AccountLockoutManagement";
import EmailBlasterPage from "./pages/EmailBlasterPage";
import PostLogout from "./pages/PostLogout";
import LifeAssurance from "./pages/ProtectionDetails/LifeAssurance";
import SeriousIllness from "./pages/ProtectionDetails/SeriousIllness";
import IncomeProtection from "./pages/ProtectionDetails/IncomeProtection";
import AccidentSickness from "./pages/ProtectionDetails/AccidentSickness";
import PersonalAccident from "./pages/ProtectionDetails/PersonalAccident";
import PRSADetail from "./pages/PensionsDetails/PRSADetail";
import AVCsDetail from "./pages/PensionsDetails/AVCsDetail";
import OccupationalDetail from "./pages/PensionsDetails/OccupationalDetail";
import ExecutiveDetail from "./pages/PensionsDetails/ExecutiveDetail";
import ARFDetail from "./pages/PensionsDetails/ARFDetail";
import IndividualHealth from "./pages/HealthInsuranceDetails/IndividualHealth";
import FamilyHealth from "./pages/HealthInsuranceDetails/FamilyHealth";
import CorporateHealth from "./pages/HealthInsuranceDetails/CorporateHealth";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth-selection" component={AuthSelection} />
      <Route path="/phone-auth" component={PhoneAuth} />
      <Route path="/email-auth" component={EmailAuth} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/fact-finding" component={FactFindingForm} />
      <Route path="/fact-finding/:product" component={FactFindingForm} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/user/dashboard" component={UserLanding} />
      <Route path="/customer/dashboard" component={CustomerLanding} />
      <Route path="/user/:userId" component={UserPortal} />
      <Route path="/customer/:customerId" component={CustomerPortal} />
      <Route path="/user-portal" component={UserPortal} />
      <Route path="/customer-portal" component={CustomerPortal} />
      <Route path="/protection" component={Protection} />
      <Route path="/protection/life-assurance" component={LifeAssurance} />
      <Route path="/protection/serious-illness" component={SeriousIllness} />
      <Route path="/protection/income-protection" component={IncomeProtection} />
      <Route path="/protection/accident-sickness" component={AccidentSickness} />
      <Route path="/protection/personal-accident" component={PersonalAccident} />
      <Route path="/pensions" component={Pensions} />
      <Route path="/pensions/prsa" component={PRSADetail} />
      <Route path="/pensions/avcs" component={AVCsDetail} />
      <Route path="/pensions/occupational" component={OccupationalDetail} />
      <Route path="/pensions/executive" component={ExecutiveDetail} />
      <Route path="/pensions/arf" component={ARFDetail} />
      <Route path="/health-insurance" component={HealthInsurance} />
      <Route path="/health-insurance/individual" component={IndividualHealth} />
      <Route path="/health-insurance/family" component={FamilyHealth} />
      <Route path="/health-insurance/group" component={CorporateHealth} />
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
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/customers/:customerId" component={AdminCustomerDetail} />
      <Route path="/admin/account-lockout-management" component={AccountLockoutManagement} />
      <Route path="/email-blaster" component={EmailBlasterPage} />
      <Route path="/post-logout" component={PostLogout} />
      <Route path="/manager/dashboard" component={ManagerDashboard} />
      <Route path="/support/dashboard" component={SupportDashboard} />
      <Route path="/staff/dashboard" component={StaffDashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { handleLogout, isLoggingOut } = useAuth();

  const handleSessionTimeout = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  const handleWarning = useCallback((time: number) => {
    setTimeRemaining(time);
  }, []);

  const { isWarningVisible, extendSession } = useSessionTimeout(
    handleSessionTimeout,
    handleWarning,
    {
      enabled: true,
      timeoutDuration: 30 * 60 * 1000,
      warningDuration: 2 * 60 * 1000,
    }
  );

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider
          defaultTheme="light"
        >
          <TooltipProvider>
            <WeComWidgetSimple />
            <Router />
            <SessionTimeoutWarning
              open={isWarningVisible}
              timeRemaining={timeRemaining}
              onExtend={extendSession}
              onLogout={handleSessionTimeout}
              isLoggingOut={isLoggingOut}
            />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
