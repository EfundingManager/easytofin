import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function GeneralInsurance() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'generalInsurance.home'),
      description: t(language, 'generalInsurance.homeDesc'),
      href: '/services/general-insurance/home',
    },
    {
      title: t(language, 'generalInsurance.motor'),
      description: t(language, 'generalInsurance.motorDesc'),
      href: '/services/general-insurance/motor',
    },
    {
      title: t(language, 'generalInsurance.business'),
      description: t(language, 'generalInsurance.businessDesc'),
      href: '/services/general-insurance/business',
    },
    {
      title: t(language, 'generalInsurance.landlord'),
      description: t(language, 'generalInsurance.landlordDesc'),
      href: '/services/general-insurance/landlord',
    },

    {
      title: t(language, 'generalInsurance.liability'),
      description: t(language, 'generalInsurance.liabilityDesc'),
      href: '/services/general-insurance/liability',
    },
  ];

  return (
    <ServicePage
      subServices={subServices}
    />
  );
}
