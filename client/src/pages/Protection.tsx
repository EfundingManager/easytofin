import { Shield } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function Protection() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'protection.lifeAssurance'),
      description: t(language, 'protection.lifeAssuranceDesc'),
    },
    {
      title: t(language, 'protection.seriousIllness'),
      description: t(language, 'protection.seriousIllnessDesc'),
    },
    {
      title: t(language, 'protection.incomeProtection'),
      description: t(language, 'protection.incomeProtectionDesc'),
    },
    {
      title: t(language, 'protection.accidentSickness'),
      description: t(language, 'protection.accidentSicknessDesc'),
    },
    {
      title: t(language, 'protection.personalAccident'),
      description: t(language, 'protection.personalAccidentDesc'),
    },

  ];

  const whyPoints = t(language, 'protection.whyProtectionPoints');

  return (
    <ServicePage
      title={t(language, 'protection.title')}
      tagline={t(language, 'protection.tagline')}
      heroDescription={t(language, 'protection.heroDesc')}
      icon={<Shield size={28} />}
      subServices={subServices}
      whySection={{
        title: t(language, 'protection.whyProtection'),
        points: Array.isArray(whyPoints) ? whyPoints : [],
        content: {
          heading: t(language, 'protection.personalAllRoundProtectionHeading'),
          paragraphs: (t(language, 'protection.personalAllRoundProtectionContent') as unknown as string[]) || [],
        },
      }}
      relatedServices={[
        { label: t(language, 'services.pensions'), href: "/pensions" },
        { label: t(language, 'services.healthInsurance'), href: "/health-insurance" },

      ]}
    />
  );
}
