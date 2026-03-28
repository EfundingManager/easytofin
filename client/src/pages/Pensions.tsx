import { TrendingUp } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function Pensions() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'pensions.prsa'),
      description: t(language, 'pensions.prsaDesc'),
    },
    {
      title: t(language, 'pensions.avc'),
      description: t(language, 'pensions.avcDesc'),
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
      title: t(language, 'pensions.arf'),
      description: t(language, 'pensions.arfDesc'),
    },
  ];

  const whyPoints = t(language, 'pensions.whyPensionsPoints');
  const introductionSubtitle = t(language, 'pensions.introductionSubtitle');
  const introductionParagraphs = t(language, 'pensions.introductionContent');

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
      introductionSection={{
        title: 'Why Choose EasyToFin?',
        subtitle: typeof introductionSubtitle === 'string' ? introductionSubtitle : '',
        paragraphs: Array.isArray(introductionParagraphs) ? introductionParagraphs : [],
      }}
      relatedServices={[
        { label: t(language, 'services.protection'), href: "/protection" },
        { label: t(language, 'services.investments'), href: "/investments" },

      ]}
    />
  );
}
