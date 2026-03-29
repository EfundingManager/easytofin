import { Heart } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";

export default function HealthInsurance() {
  const { language } = useLanguage();
  const health = translations[language]?.healthInsurance || translations['en'].healthInsurance;

  const subServices = [
    {
      title: health.individual,
      description: health.individualDesc,
    },
    {
      title: health.family,
      description: health.familyDesc,
    },
    {
      title: health.corporate,
      description: health.corporateDesc,
    },
    {
      title: health.senior,
      description: health.seniorDesc,
    },
    {
      title: health.international,
      description: health.internationalDesc,
    },
    {
      title: health.dental,
      description: health.dentalDesc,
    },
  ];

  const whyPoints = t(language, 'healthInsurance.whyHealthPoints');
  const introductionContent = t(language, 'healthInsurance.introductionContent');
  const introductionSubtitle = t(language, 'healthInsurance.introductionSubtitle');

  return (
    <ServicePage
      title={t(language, 'services.healthInsurance')}
      tagline={t(language, 'health.tagline')}
      heroDescription={t(language, 'health.heroDesc')}
      icon={<Heart size={28} />}
      subServices={subServices}
      introductionSection={{
        title: 'Why Choose EasyToFin?',
        subtitle: typeof introductionSubtitle === 'string' ? introductionSubtitle : '',
        paragraphs: Array.isArray(introductionContent) ? introductionContent : [],
      }}
      whySection={{
        title: t(language, 'healthInsurance.whyHealth'),
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
