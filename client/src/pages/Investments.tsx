import { BarChart3 } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function Investments() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'investments.investmentBonds'),
      description: t(language, 'investments.investmentBondsDesc'),
    },
    {
      title: t(language, 'investments.regularSavings'),
      description: t(language, 'investments.regularSavingsDesc'),
    },
    {
      title: t(language, 'investments.lumpSum'),
      description: t(language, 'investments.lumpSumDesc'),
    },
    {
      title: t(language, 'investments.portfolio'),
      description: t(language, 'investments.portfolioDesc'),
    },
    {
      title: t(language, 'investments.education'),
      description: t(language, 'investments.educationDesc'),
    },
    {
      title: t(language, 'investments.structured'),
      description: t(language, 'investments.structuredDesc'),
    },
  ];

  const whyPoints = t(language, 'investments.whyInvestmentsPoints');
  const introductionContent = t(language, 'investments.introductionContent');
  const introductionSubtitle = t(language, 'investments.introductionSubtitle');

  return (
    <ServicePage
      title={t(language, 'services.investments')}
      tagline={t(language, 'investments.tagline')}
      heroDescription={t(language, 'investments.heroDesc')}
      icon={<BarChart3 size={28} />}
      subServices={subServices}
      introductionSection={{
        title: 'Why Choose EasyToFin?',
        subtitle: typeof introductionSubtitle === 'string' ? introductionSubtitle : '',
        paragraphs: Array.isArray(introductionContent) ? introductionContent : [],
      }}
      whySection={{
        title: t(language, 'investments.whyInvestments'),
        points: Array.isArray(whyPoints) ? whyPoints : [],
      }}
      relatedServices={[
        { label: t(language, 'services.pensions'), href: "/pensions" },
        { label: t(language, 'services.protection'), href: "/protection" },

      ]}
    />
  );
}
