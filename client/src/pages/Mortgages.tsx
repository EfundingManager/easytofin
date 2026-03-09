import { Home as HomeIcon } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function Mortgages() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'mortgages.firstTime'),
      description: t(language, 'mortgages.firstTimeDesc'),
    },
    {
      title: t(language, 'mortgages.movers'),
      description: t(language, 'mortgages.moversDesc'),
    },
    {
      title: t(language, 'mortgages.remortgage'),
      description: t(language, 'mortgages.remortgageDesc'),
    },
    {
      title: t(language, 'mortgages.buyToLet'),
      description: t(language, 'mortgages.buyToLetDesc'),
    },
    {
      title: t(language, 'mortgages.mortgageProtection'),
      description: t(language, 'mortgages.mortgageProtectionDesc'),
    },
    {
      title: t(language, 'mortgages.advice'),
      description: t(language, 'mortgages.adviceDesc'),
    },
  ];

  const whyPoints = t(language, 'mortgages.whyMortgagesPoints');

  return (
    <ServicePage
      title={t(language, 'services.mortgages')}
      tagline={t(language, 'mortgages.tagline')}
      heroDescription={t(language, 'mortgages.heroDesc')}
      icon={<HomeIcon size={28} />}
      subServices={subServices}
      whySection={{
        title: t(language, 'mortgages.whyMortgages'),
        points: Array.isArray(whyPoints) ? whyPoints : [],
      }}
      relatedServices={[
        { label: t(language, 'services.protection'), href: "/protection" },
        { label: t(language, 'services.generalInsurance'), href: "/general-insurance" },
        { label: t(language, 'services.pensions'), href: "/pensions" },
      ]}
    />
  );
}
