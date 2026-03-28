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
  const contentHeading = t(language, 'protection.personalAllRoundProtectionHeading');
  const contentParagraphs = t(language, 'protection.personalAllRoundProtectionContent');
  const introductionSubtitle = t(language, 'protection.introductionSubtitle');
  const introductionParagraphs = t(language, 'protection.introductionContent');

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
      }}
      contentSection={{
        heading: typeof contentHeading === 'string' ? contentHeading : 'Personal All-Round Protection',
        paragraphs: Array.isArray(contentParagraphs) ? contentParagraphs : [],
      }}
      introductionSection={{
        title: 'Why Choose EasyToFin?',
        subtitle: typeof introductionSubtitle === 'string' ? introductionSubtitle : '',
        paragraphs: Array.isArray(introductionParagraphs) ? introductionParagraphs : [],
      }}
      relatedServices={[
        { label: t(language, 'services.pensions'), href: "/pensions" },
        { label: t(language, 'services.healthInsurance'), href: "/health-insurance" },

      ]}
    />
  );
}
