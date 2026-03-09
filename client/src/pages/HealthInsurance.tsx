import { Heart } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function HealthInsurance() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'health.individual'),
      description: t(language, 'health.individualDesc'),
    },
    {
      title: t(language, 'health.family'),
      description: t(language, 'health.familyDesc'),
    },
    {
      title: t(language, 'health.corporate'),
      description: t(language, 'health.corporateDesc'),
    },
    {
      title: t(language, 'health.dental'),
      description: t(language, 'health.dentalDesc'),
    },
    {
      title: t(language, 'health.vision'),
      description: t(language, 'health.visionDesc'),
    },
    {
      title: t(language, 'health.mental'),
      description: t(language, 'health.mentalDesc'),
    },
  ];

  const whyPoints = t(language, 'health.whyHealthPoints');

  return (
    <ServicePage
      title={t(language, 'services.healthInsurance')}
      tagline={t(language, 'health.tagline')}
      heroDescription={t(language, 'health.heroDesc')}
      icon={<Heart size={28} />}
      subServices={subServices}
      whySection={{
        title: t(language, 'health.whyHealth'),
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
