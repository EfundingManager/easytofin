import ServicePage from "@/components/ServicePage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function GeneralInsurance() {
  const { language } = useLanguage();

  const subServices = [
    {
      title: t(language, 'generalInsurance.home'),
      description: t(language, 'generalInsurance.homeDesc'),
      href: '/general-insurance/home',
    },
    {
      title: t(language, 'generalInsurance.motor'),
      description: t(language, 'generalInsurance.motorDesc'),
      href: '/general-insurance/motor',
    },
    {
      title: t(language, 'generalInsurance.business'),
      description: t(language, 'generalInsurance.businessDesc'),
      href: '/general-insurance/business',
    },
    {
      title: t(language, 'generalInsurance.landlord'),
      description: t(language, 'generalInsurance.landlordDesc'),
      href: '/general-insurance/landlord',
    },

    {
      title: t(language, 'generalInsurance.liability'),
      description: t(language, 'generalInsurance.liabilityDesc'),
      href: '/general-insurance/liability',
    },
  ];

  return (
    <ServicePage
      subServices={subServices}
    />
  );
}
