/* 
 * EasyToFin ServicePage — shared layout for all service pages
 * "Warm Expertise" design: teal hero, clean content, amber CTAs
 */
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

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
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="teal-gradient text-white py-16 md:py-20">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/60 text-sm mb-6 font-inter">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">{title}</span>
          </div>
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mb-5 text-white">
              {icon}
            </div>
            <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-white mb-3 leading-tight">
              {title}
            </h1>
            <p className="text-[oklch(0.76_0.19_75)] font-[Outfit] font-500 text-xl mb-4">{tagline}</p>
            <p className="text-white/80 text-base leading-relaxed mb-8 max-w-2xl font-inter">
              {heroDescription}
            </p>
            <Link href="/contact" className="btn-amber">
              {ctaText} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Sub-services grid */}
      <section className="py-16 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <div className="mb-10">
            <span className="section-tag">What We Offer</span>
            <h2 className="font-[Outfit] font-700 text-3xl text-[oklch(0.18_0.015_240)]">
              Our {title} Services
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subServices.map((s, i) => (
              <div key={i} className="service-card">
                <div className="w-8 h-8 rounded-full bg-[oklch(0.93_0.04_195)] flex items-center justify-center mb-4">
                  <span className="text-[oklch(0.40_0.11_195)] font-[Outfit] font-700 text-sm">{i + 1}</span>
                </div>
                <h3 className="font-[Outfit] font-700 text-[oklch(0.18_0.015_240)] text-lg mb-2">{s.title}</h3>
                <p className="text-[oklch(0.52_0.015_240)] text-sm leading-relaxed font-inter">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-tag">Why EasyToFin</span>
              <h2 className="font-[Outfit] font-700 text-3xl text-[oklch(0.18_0.015_240)] mb-6">
                {whySection.title}
              </h2>
              <ul className="space-y-3">
                {whySection.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[oklch(0.40_0.11_195)] mt-0.5 shrink-0" />
                    <span className="text-[oklch(0.30_0.015_240)] font-inter text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[oklch(0.97_0.003_240)] rounded-2xl p-8">
              <h3 className="font-[Outfit] font-700 text-xl text-[oklch(0.18_0.015_240)] mb-3">
                Ready to get started?
              </h3>
              <p className="text-[oklch(0.52_0.015_240)] text-sm mb-6 font-inter">
                Our expert advisors are here to help you find the right solution. Get in touch today for a free, no-obligation consultation.
              </p>
              <Link href="/contact" className="btn-primary inline-flex mb-3">
                Book a Consultation <ArrowRight size={16} />
              </Link>
              <p className="text-xs text-[oklch(0.52_0.015_240)] font-inter">
                Free advice · No obligation · Regulated by the Central Bank of Ireland
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      {relatedServices.length > 0 && (
        <section className="py-12 bg-[oklch(0.97_0.003_240)] border-t border-[oklch(0.88_0.008_240)]">
          <div className="container">
            <h3 className="font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] text-lg mb-5">
              You might also be interested in
            </h3>
            <div className="flex flex-wrap gap-3">
              {relatedServices.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-[oklch(0.88_0.008_240)] text-[oklch(0.30_0.015_240)] text-sm font-[Outfit] font-500 hover:border-[oklch(0.40_0.11_195)] hover:text-[oklch(0.40_0.11_195)] transition-colors"
                >
                  {s.label} <ChevronRight size={14} />
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
