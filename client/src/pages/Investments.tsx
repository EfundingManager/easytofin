import { BarChart3 } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function Investments() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'investments.savings'),
      description: t(language, 'investments.savingsDesc'),
    },
    {
      title: t(language, 'investments.bonds'),
      description: t(language, 'investments.bondsDesc'),
    },
    {
      title: t(language, 'investments.funds'),
      description: t(language, 'investments.fundsDesc'),
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
      title: t(language, 'investments.review'),
      description: t(language, 'investments.reviewDesc'),
    },
  ];

  const whyPoints = t(language, 'investments.whyInvestmentsPoints');
  const introductionContent = t(language, 'investments.introductionContent');

  return (
    <ServicePage
      title={t(language, 'services.investments')}
      tagline={t(language, 'investments.tagline')}
      heroDescription={t(language, 'investments.heroDesc')}
      icon={<BarChart3 size={28} />}
      subServices={subServices}
      introductionSection={{
        title: t(language, 'services.investments'),
        subtitle: t(language, 'investments.introductionSubtitle'),
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
