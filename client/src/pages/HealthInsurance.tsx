import { useLanguage } from "@/contexts/LanguageContext";
import ServicePage from "@/components/ServicePage";
import { getServicePageTranslations } from "@/lib/servicePageTranslations";

export default function HealthInsurance() {
  const { language } = useLanguage();
  const products = getServicePageTranslations('healthInsurance', language as 'en' | 'zh' | 'pl');

  return (
    <ServicePage
      subServices={products}
    />
  );
}
