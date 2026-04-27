import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function Investments() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'investments.investmentBonds'),
      description: t(language, 'investments.investmentBondsDesc'),
      href: '/services/investments/bonds',
    },
    {
      title: t(language, 'investments.regularSavings'),
      description: t(language, 'investments.regularSavingsDesc'),
      href: '/services/investments/savings-plans',
    },
    {
      title: t(language, 'investments.lumpSum'),
      description: t(language, 'investments.lumpSumDesc'),
      href: '/services/investments/stocks-shares',
    },
    {
      title: t(language, 'investments.portfolio'),
      description: t(language, 'investments.portfolioDesc'),
      href: '/services/investments/portfolio-management',
    },
    {
      title: t(language, 'investments.education'),
      description: t(language, 'investments.educationDesc'),
      href: '/services/investments/education-plans',
    },
    {
      title: t(language, 'investments.structured'),
      description: t(language, 'investments.structuredDesc'),
      href: '/services/investments/structured-products',
    },
  ];

  return (
    <ServicePage
      subServices={subServices}
    />
  );
}
