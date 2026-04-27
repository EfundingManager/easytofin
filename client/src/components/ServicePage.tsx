import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface ServicePageProps {
  subServices: Array<{
    title: string;
    description: string;
    href?: string;
  }>;
}

export default function ServicePage({
  subServices,
}: ServicePageProps) {
  const { language } = useLanguage();

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sub Services - What We Offer */}
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

      <Footer />
    </div>
    </>
  );
}
