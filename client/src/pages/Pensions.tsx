import { TrendingUp } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function Pensions() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'pensions.personalPensions'),
      description: t(language, 'pensions.personalPensionsDesc'),
    },
    {
      title: t(language, 'pensions.occupational'),
      description: t(language, 'pensions.occupationalDesc'),
    },
    {
      title: t(language, 'pensions.executive'),
      description: t(language, 'pensions.executiveDesc'),
    },
    {
      title: t(language, 'pensions.avc'),
      description: t(language, 'pensions.avcDesc'),
    },
    {
      title: t(language, 'pensions.prsas'),
      description: t(language, 'pensions.prsasDesc'),
    },
    {
      title: t(language, 'pensions.arfs'),
      description: t(language, 'pensions.arfsDesc'),
    },
  ];

  const whyPoints = t(language, 'pensions.whyPensionsPoints');

  return (
    <ServicePage
      title={t(language, 'services.pensions')}
      tagline={t(language, 'pensions.tagline')}
      heroDescription={t(language, 'pensions.heroDesc')}
      icon={<TrendingUp size={28} />}
      subServices={subServices}
      whySection={{
        title: t(language, 'pensions.whyPensions'),
        points: Array.isArray(whyPoints) ? whyPoints : [],
      }}
      relatedServices={[
        { label: t(language, 'services.protection'), href: "/protection" },
        { label: t(language, 'services.investments'), href: "/investments" },

      ]}
    />
  );
}
