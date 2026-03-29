import { Building2 } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function GeneralInsurance() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'generalInsurance.home'),
      description: t(language, 'generalInsurance.homeDesc'),
    },
    {
      title: t(language, 'generalInsurance.motor'),
      description: t(language, 'generalInsurance.motorDesc'),
    },
    {
      title: t(language, 'generalInsurance.business'),
      description: t(language, 'generalInsurance.businessDesc'),
    },
    {
      title: t(language, 'generalInsurance.landlord'),
      description: t(language, 'generalInsurance.landlordDesc'),
    },
    {
      title: t(language, 'generalInsurance.travel'),
      description: t(language, 'generalInsurance.travelDesc'),
    },
    {
      title: t(language, 'generalInsurance.liability'),
      description: t(language, 'generalInsurance.liabilityDesc'),
    },
  ];

  const whyPoints = t(language, 'generalInsurance.whyBrokerPoints');
  const introductionContent = t(language, 'generalInsurance.introductionContent');
  const introductionSubtitle = t(language, 'generalInsurance.introductionSubtitle');

  return (
    <ServicePage
      title={t(language, 'services.generalInsurance')}
      tagline={t(language, 'generalInsurance.tagline')}
      heroDescription={t(language, 'generalInsurance.heroDesc')}
      icon={<Building2 size={28} />}
      subServices={subServices}
      introductionSection={{
        title: 'Why Choose EasyToFin?',
        subtitle: typeof introductionSubtitle === 'string' ? introductionSubtitle : '',
        paragraphs: Array.isArray(introductionContent) ? introductionContent : [],
      }}
      whySection={{
        title: t(language, 'generalInsurance.whyBroker'),
        points: Array.isArray(whyPoints) ? whyPoints : [],
      }}
      relatedServices={[
        { label: t(language, 'services.protection'), href: "/protection" },

        { label: t(language, 'services.healthInsurance'), href: "/health-insurance" },
      ]}
    />
  );
}
