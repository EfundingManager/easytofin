import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDetailPageTranslation } from "@/lib/allDetailTranslations";

export default function ARFDetail() {
  const { language } = useLanguage();
  const translation = getDetailPageTranslation('arf', language as 'en' | 'zh' | 'pl');

  const sectionTitles = {
    overview: language === 'en' ? 'Overview' : language === 'zh' ? '概述' : 'Przegląd',
    coverage: language === 'en' ? 'Coverage Details' : language === 'zh' ? '保障详情' : 'Szczegóły ubezpieczenia',
    keyAspects: language === 'en' ? 'Key Aspects' : language === 'zh' ? '主要方面' : 'Główne aspekty',
    taxBenefits: language === 'en' ? 'Tax Benefits' : language === 'zh' ? '税收优惠' : 'Korzyści podatkowe',
    features: language === 'en' ? 'Key Features' : language === 'zh' ? '主要特性' : 'Główne cechy',
    exclusions: language === 'en' ? 'Key Exclusions' : language === 'zh' ? '主要排除项' : 'Główne wyłączenia',
    premiumInfo: language === 'en' ? 'Premium Information' : language === 'zh' ? '保费信息' : 'Informacje o składce',
    regulatory: language === 'en' ? 'Important Information' : language === 'zh' ? '重要信息' : 'Ważne informacje',
    cta: language === 'en' ? 'Get a Quote' : language === 'zh' ? '获取报价' : 'Uzyskaj wycenę',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button & Language Switcher */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container flex justify-between items-center">
          <Link href="/services/pensions" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> {language === 'en' ? 'Back' : language === 'zh' ? '返回' : 'Wróć'}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">
            {translation?.title || 'ARF'}
          </h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">{sectionTitles.overview}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {translation?.overview || 'Overview content'}
            </p>
          </div>

          {/* Coverage/Key Aspects */}
          {translation?.sections?.coverage && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">{sectionTitles.coverage}</h2>
              <div className="space-y-4">
                {translation.sections.coverage.map((item: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-teal-600 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.heading}</h3>
                    <p className="text-gray-700 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Aspects */}
          {translation?.sections?.keyAspects && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">{sectionTitles.keyAspects}</h2>
              <div className="space-y-4">
                {translation.sections.keyAspects.map((item: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-teal-600 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.heading}</h3>
                    <p className="text-gray-700 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax Benefits */}
          {translation?.sections?.taxBenefits && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">{sectionTitles.taxBenefits}</h2>
              <div className="bg-teal-50 p-6 rounded-lg space-y-4">
                {translation.sections.taxBenefits.map((item: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.heading}</h3>
                    <p className="text-gray-700 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          {translation?.sections?.features && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">{sectionTitles.features}</h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {translation.sections.features.map((feature: string, idx: number) => (
                  <li key={idx}>• {feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Exclusions */}
          {translation?.sections?.exclusions && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">{sectionTitles.exclusions}</h2>
              <div className="bg-red-50 p-6 rounded-lg">
                <ul className="space-y-2 text-gray-700 text-sm">
                  {translation.sections.exclusions.map((exclusion: string, idx: number) => (
                    <li key={idx}>• {exclusion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Premium Information */}
          {translation?.sections?.premiumInfo && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">{sectionTitles.premiumInfo}</h2>
              <div className="bg-teal-50 p-6 rounded-lg space-y-4">
                {translation.sections.premiumInfo.map((item: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.heading}</h3>
                    <p className="text-gray-700 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">{sectionTitles.regulatory}</h2>
            <p className="text-gray-700 text-xs">
              {translation?.regulatory || 'This product is regulated by the Central Bank of Ireland.'}
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              {translation?.cta?.title || sectionTitles.cta}
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              {translation?.cta?.description || 'Contact our expert advisors for more information.'}
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-teal-700 transition-colors">
              {translation?.cta?.button || 'Contact Us'} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
