/* 
 * EasyToFin ServicePage — shared layout for all service pages with bilingual support
 * "Warm Expertise" design: teal hero, clean content, amber CTAs
 */
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

interface SubService {
  title: string;
  description: string;
}

interface ServicePageProps {
  title: string;
  tagline: string;
  heroDescription: string;
  icon: React.ReactNode;
  subServices: SubService[];
  whySection: {
    title: string;
    points: string[];
  };
  ctaText?: string;
  relatedServices?: { label: string; href: string }[];
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
}: ServicePageProps) {
  const { language } = useLanguage();
  const breadcrumbHome = language === 'en' ? 'Home' : '首页';
  const getQuoteText = ctaText === "Get a Free Quote" ? t(language, 'home.learnMore') : t(language, 'nav.getQuote');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />


      {/* Sub Services */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mb-12">
            {language === 'en' ? 'What We Offer' : '我们提供的服务'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subServices.map((service, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-[oklch(0.93_0.04_195)] flex items-center justify-center shrink-0 text-[oklch(0.40_0.11_195)] mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="font-[Outfit] font-700 text-[oklch(0.18_0.015_240)] text-lg mb-2">
                    {service.title}
                  </h3>
                  <p className="text-[oklch(0.52_0.015_240)] font-inter text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-20 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mb-12">
            {whySection.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whySection.points.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[oklch(0.40_0.11_195)] mt-0.5 shrink-0" />
                <p className="text-[oklch(0.30_0.015_240)] font-inter text-sm leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
  );
}
