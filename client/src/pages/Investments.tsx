import { useLanguage } from "@/contexts/LanguageContext";
import ServicePage from "@/components/ServicePage";
import { getServicePageTranslations } from "@/lib/servicePageTranslations";

export default function Investments() {
  const { language } = useLanguage();
  const products = getServicePageTranslations('investments', language as 'en' | 'zh' | 'pl');

  return (
    <ServicePage
      subServices={products}
    />
  );
}
