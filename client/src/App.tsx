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
import UserManagement from "./pages/UserManagement";
import AdminLogs from "./pages/AdminLogs";
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
import HomeInsurance from "./pages/GeneralInsuranceDetails/HomeInsurance";
import MotorInsurance from "./pages/GeneralInsuranceDetails/MotorInsurance";
import BusinessInsurance from "./pages/GeneralInsuranceDetails/BusinessInsurance";
import LandlordInsurance from "./pages/GeneralInsuranceDetails/LandlordInsurance";
import LiabilityInsurance from "./pages/GeneralInsuranceDetails/LiabilityInsurance";
import SavingsPlans from "./pages/InvestmentsDetails/SavingsPlans";
import InvestmentBonds from "./pages/InvestmentsDetails/InvestmentBonds";
import PortfolioManagement from "./pages/InvestmentsDetails/PortfolioManagement";
import StocksShares from "./pages/InvestmentsDetails/StocksShares";
import EducationSavingPlans from "./pages/InvestmentsDetails/EducationSavingPlans";
import StructuredProducts from "./pages/InvestmentsDetails/StructuredProducts";
import TOTPSetupFlow from "./pages/TOTPSetupFlow";
import TOTPVerify from "./pages/TOTPVerify";

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
      <Route path="/services/protection" component={Protection} />
      <Route path="/services/protection/life-assurance" component={LifeAssurance} />
      <Route path="/services/protection/serious-illness" component={SeriousIllness} />
      <Route path="/services/protection/income-protection" component={IncomeProtection} />
      <Route path="/services/protection/accident-sickness" component={AccidentSickness} />
      <Route path="/services/protection/personal-accident" component={PersonalAccident} />
      <Route path="/services/pensions" component={Pensions} />
      <Route path="/services/pensions/prsa" component={PRSADetail} />
      <Route path="/services/pensions/avcs" component={AVCsDetail} />
      <Route path="/services/pensions/occupational" component={OccupationalDetail} />
      <Route path="/services/pensions/executive" component={ExecutiveDetail} />
      <Route path="/services/pensions/arf" component={ARFDetail} />
      <Route path="/services/health-insurance" component={HealthInsurance} />
      <Route path="/services/health-insurance/individual" component={IndividualHealth} />
      <Route path="/services/health-insurance/family" component={FamilyHealth} />
      <Route path="/services/health-insurance/group" component={CorporateHealth} />
      <Route path="/services/general-insurance" component={GeneralInsurance} />
      <Route path="/services/general-insurance/home" component={HomeInsurance} />
      <Route path="/services/general-insurance/motor" component={MotorInsurance} />
      <Route path="/services/general-insurance/business" component={BusinessInsurance} />
      <Route path="/services/general-insurance/landlord" component={LandlordInsurance} />
      <Route path="/services/general-insurance/liability" component={LiabilityInsurance} />

      <Route path="/services/investments" component={Investments} />
      <Route path="/services/investments/savings-plans" component={SavingsPlans} />
      <Route path="/services/investments/bonds" component={InvestmentBonds} />
      <Route path="/services/investments/portfolio-management" component={PortfolioManagement} />
      <Route path="/services/investments/stocks-shares" component={StocksShares} />
      <Route path="/services/investments/education-plans" component={EducationSavingPlans} />
      <Route path="/services/investments/structured-products" component={StructuredProducts} />

      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms-of-business" component={TermsOfBusiness} />
      <Route path="/terms" component={TermsOfBusiness} />
      <Route path="/2fa" component={TwoFactorAuth} />
      <Route path="/totp/setup" component={TOTPSetupFlow} />
      <Route path="/totp/verify" component={TOTPVerify} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/customers/:customerId" component={AdminCustomerDetail} />
      <Route path="/admin/account-lockout-management" component={AccountLockoutManagement} />
      <Route path="/email-blaster" component={EmailBlasterPage} />
      <Route path="/admin/user-management" component={UserManagement} />
      <Route path="/admin/logs" component={AdminLogs} />
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
