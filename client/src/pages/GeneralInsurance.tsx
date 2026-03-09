import { Building2 } from "lucide-react";
import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function GeneralInsurance() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'general.homeowners'),
      description: t(language, 'general.homeownersDesc'),
    },
    {
      title: t(language, 'general.renters'),
      description: t(language, 'general.rentersDesc'),
    },
    {
      title: t(language, 'general.motor'),
      description: t(language, 'general.motorDesc'),
    },
    {
      title: t(language, 'general.travel'),
      description: t(language, 'general.travelDesc'),
    },
    {
      title: t(language, 'general.pet'),
      description: t(language, 'general.petDesc'),
    },
    {
      title: t(language, 'general.business'),
      description: t(language, 'general.businessDesc'),
    },
  ];

  const whyPoints = t(language, 'general.whyGeneralPoints');

  return (
    <ServicePage
      title={t(language, 'services.generalInsurance')}
      tagline={t(language, 'general.tagline')}
      heroDescription={t(language, 'general.heroDesc')}
      icon={<Building2 size={28} />}
      subServices={subServices}
      whySection={{
        title: t(language, 'general.whyGeneral'),
        points: Array.isArray(whyPoints) ? whyPoints : [],
      }}
      relatedServices={[
        { label: t(language, 'services.protection'), href: "/protection" },
        { label: t(language, 'services.mortgages'), href: "/mortgages" },
        { label: t(language, 'services.healthInsurance'), href: "/health-insurance" },
      ]}
    />
  );
}
