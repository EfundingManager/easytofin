import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, getArrayTranslation } from "@/lib/i18n";

interface DetailSection {
  title: string;
  items: Array<{
    heading: string;
    content: string;
  }>;
}

interface DetailPageProps {
  pageTitle: string;
  backLink: string;
  translationKey: string;
  sections: {
    overview?: DetailSection;
    coverage?: DetailSection;
    keyAspects?: DetailSection;
    taxBenefits?: DetailSection;
    exclusions?: DetailSection;
    premiumInfo?: DetailSection;
    whoNeeds?: DetailSection;
    keyFeatures?: DetailSection;
    whoShouldConsider?: DetailSection;
  };
}

export default function DetailPageTemplate({
  pageTitle,
  backLink,
  translationKey,
  sections,
}: DetailPageProps) {
  const { language } = useLanguage();

  const getTranslatedSection = (sectionKey: string, fallback: DetailSection | undefined) => {
    if (!fallback) return null;
    
    const translatedItems = fallback.items.map((item) => ({
      heading: t(language, `${translationKey}.${sectionKey}.${item.heading.replace(/\s+/g, '_').toLowerCase()}.heading`) || item.heading,
      content: t(language, `${translationKey}.${sectionKey}.${item.heading.replace(/\s+/g, '_').toLowerCase()}.content`) || item.content,
    }));

    return {
      title: t(language, `${translationKey}.${sectionKey}.title`) || fallback.title,
      items: translatedItems,
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container">
          <Link href={backLink} className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> {t(language, 'common.back') || 'Back'}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">
            {t(language, `${translationKey}.title`) || pageTitle}
          </h1>

          {/* Overview */}
          {sections.overview && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">
                {t(language, `${translationKey}.overview.title`) || 'Overview'}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t(language, `${translationKey}.overview.content1`) || sections.overview.items[0]?.content}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t(language, `${translationKey}.overview.content2`) || sections.overview.items[1]?.content}
              </p>
            </div>
          )}

          {/* Key Aspects / Coverage / Features */}
          {(sections.keyAspects || sections.coverage || sections.keyFeatures) && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">
                {sections.keyAspects && (t(language, `${translationKey}.keyAspects.title`) || 'Key Aspects')}
                {sections.coverage && (t(language, `${translationKey}.coverage.title`) || 'Coverage Details')}
                {sections.keyFeatures && (t(language, `${translationKey}.keyFeatures.title`) || 'Key Features')}
              </h2>
              <div className="space-y-4">
                {(sections.keyAspects || sections.coverage || sections.keyFeatures)?.items.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-teal-600 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.heading}</h3>
                    <p className="text-gray-700 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax Benefits */}
          {sections.taxBenefits && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">
                {t(language, `${translationKey}.taxBenefits.title`) || 'Tax Benefits'}
              </h2>
              <div className="bg-teal-50 p-6 rounded-lg space-y-4">
                {sections.taxBenefits.items.map((item, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.heading}</h3>
                    <p className="text-gray-700 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exclusions */}
          {sections.exclusions && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">
                {t(language, `${translationKey}.exclusions.title`) || 'Key Exclusions'}
              </h2>
              <div className="bg-red-50 p-6 rounded-lg space-y-3">
                <p className="text-gray-700 text-sm">
                  {t(language, `${translationKey}.exclusions.intro`) || 'Please note that the following are typically not covered:'}
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  {sections.exclusions.items.map((item, idx) => (
                    <li key={idx}>• {item.content}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Premium Information */}
          {sections.premiumInfo && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">
                {t(language, `${translationKey}.premiumInfo.title`) || 'Premium Information'}
              </h2>
              <div className="bg-teal-50 p-6 rounded-lg space-y-4">
                {sections.premiumInfo.items.map((item, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.heading}</h3>
                    <p className="text-gray-700 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Who Needs It / Who Should Consider It */}
          {(sections.whoNeeds || sections.whoShouldConsider) && (
            <div className="mb-10">
              <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">
                {sections.whoNeeds && (t(language, `${translationKey}.whoNeeds.title`) || 'Who Needs It')}
                {sections.whoShouldConsider && (t(language, `${translationKey}.whoShouldConsider.title`) || 'Who Should Consider It')}
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {(sections.whoNeeds || sections.whoShouldConsider)?.items.map((item, idx) => (
                  <li key={idx}>• {item.content}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">
              {t(language, `${translationKey}.regulatory.title`) || 'Important Information'}
            </h2>
            <p className="text-gray-700 text-xs">
              {t(language, `${translationKey}.regulatory.content`) || 'This product is regulated by the Central Bank of Ireland. All policies comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request.'}
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              {t(language, `${translationKey}.cta.title`) || 'Get a Quote'}
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              {t(language, `${translationKey}.cta.description`) || 'Speak with our expert advisors to find the right solution for your needs.'}
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-teal-700 transition-colors">
              {t(language, `${translationKey}.cta.button`) || 'Contact Us'} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
