import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface WhySection {
  title: string;
  points: string[];
}

interface ServicePageProps {
  title: string;
  tagline: string;
  heroDescription: string;
  icon: React.ReactNode;
  subServices: Array<{
    title: string;
    description: string;
    href?: string;
  }>;
  whySection: WhySection;
  ctaText?: string;
  relatedServices?: Array<{
    label: string;
    href: string;
  }>;
  contentSection?: {
    heading: string;
    paragraphs: string[];
  };
  introductionSection?: {
    title?: string;
    subtitle?: string;
    paragraphs: string[];
  };
}

export default function ServicePage({
  title,
  tagline,
  heroDescription,
  icon,
  subServices,
  whySection,
  ctaText = "Get a Free Quote",
  relatedServices = [],
  contentSection,
  introductionSection,
}: ServicePageProps) {
  const { language } = useLanguage();
  const breadcrumbHome = language === 'en' ? 'Home' : '首页';
  const getQuoteText = ctaText === "Get a Free Quote" ? t(language, 'home.learnMore') : t(language, 'nav.getQuote');

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sub Services */}
      <section className="py-16 bg-white">
        <div className="container">
          <h3 className="font-[Outfit] font-700 text-xl text-[oklch(0.18_0.015_240)] mb-8">
            {t(language, 'common.whatWeOffer')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subServices.map((service, i) => (
              <div key={i} className="p-6 rounded-lg border border-[oklch(0.88_0.008_240)] hover:border-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.97_0.003_240)] transition-all flex flex-col">
                <h4 className="font-[Outfit] font-semibold text-[oklch(0.18_0.015_240)] mb-3">
                  {service.title}
                </h4>
                <div className="h-1 w-8 bg-[oklch(0.40_0.11_195)] rounded-full mb-4"></div>
                <div className="space-y-2 flex-grow">
                  <p className="text-[oklch(0.52_0.015_240)] font-inter text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
                {service.href && (
                  <Link href={service.href} className="inline-flex items-center gap-1 text-[oklch(0.40_0.11_195)] hover:text-[oklch(0.35_0.12_195)] font-semibold text-sm mt-4 transition-colors">
                    Learn more →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      {introductionSection && (
        <section className="py-16 bg-[oklch(0.97_0.003_240)]">
          <div className="container">
            <div className="space-y-4 max-w-3xl">
              {introductionSection.title && (
                <h4 className="text-[oklch(0.30_0.015_240)] font-inter leading-relaxed text-lg font-semibold">
                  {introductionSection.title === 'Why Choose EasyToFin?' ? (language === 'zh' ? '为什么选择EasyToFin？' : language === 'pl' ? 'Dlaczego wybrać EasyToFin?' : 'Why Choose EasyToFin?') : introductionSection.title}
                </h4>
              )}
              {introductionSection.subtitle && (
                <p className="text-[oklch(0.30_0.015_240)] font-inter leading-relaxed text-base">
                  {introductionSection.subtitle}
                </p>
              )}
              {introductionSection.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-[oklch(0.30_0.015_240)] font-inter leading-relaxed text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-16 bg-white border-t border-[oklch(0.88_0.008_240)]">
          <div className="container">
            <h3 className="font-[Outfit] font-700 text-xl text-[oklch(0.18_0.015_240)] mb-6">
              {t(language, 'common.youMightAlso')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedServices.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="p-4 rounded-lg border border-[oklch(0.88_0.008_240)] hover:border-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.97_0.003_240)] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[Outfit] font-semibold text-[oklch(0.18_0.015_240)] group-hover:text-[oklch(0.40_0.11_195)] transition-colors">
                      {service.label}
                    </span>
                    <ArrowRight size={16} className="text-[oklch(0.40_0.11_195)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
    </>
  );
}
