/* 
 * EasyToFin Home Page — "Warm Expertise" design with full bilingual support
 * Hero: full-width with generated image, teal overlay, bold headline
 * Services: 6-card grid with icons and descriptions
 * Why us: 3-column feature grid
 * Testimonials + CTA banner
 */
import { Link } from "wouter";
import { ArrowRight, Shield, TrendingUp, Heart, Home as HomeIcon, Building2, BarChart3, CheckCircle2, Star, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416267905/Dmr4obss8SQ94M9JEtE8y7/hero-banner-DQ43hiRTQkWyHmsrFp5TGz.webp";

const getServices = (lang: 'en' | 'zh' | 'pl') => [
  {
    icon: <Shield size={26} />,
    title: t(lang, 'services.protection'),
    desc: t(lang, 'home.protection') || "Life assurance, serious illness cover, income protection and more — safeguard what matters most.",
    href: "/services/protection",
    color: "oklch(0.92_0.02_155)",
    iconColor: "oklch(0.40_0.10_155)",
  },
  {
    icon: <TrendingUp size={26} />,
    title: t(lang, 'services.pensions'),
    desc: t(lang, 'home.pensions') || "Personal pensions, occupational schemes, ARFs, PRSAs — plan the retirement you deserve.",
    href: "/services/pensions",
    color: "oklch(0.92_0.02_155)",
    iconColor: "oklch(0.40_0.10_155)",
  },
  {
    icon: <Heart size={26} />,
    title: t(lang, 'services.healthInsurance'),
    desc: t(lang, 'home.healthInsurance') || "Private medical insurance plans for individuals, families and businesses across all budgets.",
    href: "/services/health-insurance",
    color: "oklch(0.92_0.02_155)",
    iconColor: "oklch(0.40_0.10_155)",
  },
  {
    icon: <Building2 size={26} />,
    title: t(lang, 'services.generalInsurance'),
    desc: t(lang, 'home.generalInsurance') || "Home, motor, business and liability insurance — comprehensive cover at competitive rates.",
    href: "/services/general-insurance",
    color: "oklch(0.92_0.02_155)",
    iconColor: "oklch(0.40_0.10_155)",
  },

  {
    icon: <BarChart3 size={26} />,
    title: t(lang, 'services.investments'),
    desc: t(lang, 'home.investments') || "Savings plans, investment bonds and portfolio management to grow your wealth over time.",
    href: "/services/investments",
    color: "oklch(0.92_0.02_155)",
    iconColor: "oklch(0.40_0.10_155)",
  },
];

const getWhyPoints = (lang: 'en' | 'zh' | 'pl') => [
  {
    icon: <CheckCircle2 size={22} />,
    title: t(lang, 'why.impartial'),
    desc: t(lang, 'why.impartialDesc'),
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: t(lang, 'why.trustedReg'),
    desc: t(lang, 'why.trustedRegDesc'),
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: t(lang, 'why.expertAdvisors'),
    desc: t(lang, 'why.expertAdvisorsDesc'),
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: t(lang, 'why.tailored'),
    desc: t(lang, 'why.tailoredDesc'),
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: t(lang, 'why.wholeMarket'),
    desc: t(lang, 'why.wholeMarketDesc'),
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: t(lang, 'why.ongoingSupport'),
    desc: t(lang, 'why.ongoingSupportDesc'),
  },
];

const getTestimonials = (lang: 'en' | 'zh' | 'pl') => [
  {
    text: t(lang, 'testimonials.sarah'),
    author: "Sarah M.",
    location: lang === 'en' ? "Dublin" : lang === 'zh' ? "都柏林" : "Dublin",
    rating: 5,
  },
  {
    text: t(lang, 'testimonials.james'),
    author: "James L.",
    location: lang === 'en' ? "Cork" : lang === 'zh' ? "科克" : "Cork",
    rating: 5,
  },
  {
    text: t(lang, 'testimonials.aoife'),
    author: "Aoife K.",
    location: lang === 'en' ? "Galway" : lang === 'zh' ? "戈尔韦" : "Galway",
    rating: 5,
  },
];

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const services = getServices(language);
  const whyPoints = getWhyPoints(language);
  const testimonials = getTestimonials(language);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[580px] md:min-h-[640px] flex items-center overflow-hidden">
        <img
          src={HERO_IMG}
          alt={language === 'en' ? "EasyToFin financial advisors meeting with clients" : "EasyToFin财务顾问与客户会面"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.22_0.07_195)/0.92] via-[oklch(0.22_0.07_195)/0.75] to-[oklch(0.22_0.07_195)/0.20]" />
        <div className="relative container py-20">
          <div className="max-w-2xl">

            <h1 className="font-[Outfit] font-800 text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-5">
              Your Financial Future,<br /><span className="text-[oklch(0.82_0.17_70)]">Made Easy</span>
            </h1>
            <p className="text-white/80 text-xl md:text-2xl leading-relaxed mb-8 font-inter max-w-2xl font-semibold">
              {t(language, 'home.description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-gold text-sm px-6 py-3.5 flex items-center gap-2">
                {t(language, 'home.learnMore')} <ArrowRight size={16} />
              </Link>
              <a href="tel:1800008888" className="btn-white text-sm px-6 py-3.5 flex items-center gap-2">
                <Phone size={16} /> {t(language, 'home.callNow')}
              </a>
            </div>
          </div>
        </div>
       </section>

      {/* Services */}
      <section className="py-20 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <div className="text-center mb-14">
            <span className="section-tag">{t(language, 'home.ourServices')}</span>
            <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mt-3">
              {t(language, 'home.whatWeOffer')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <Link key={i} href={service.href} className="group">
                <div className="bg-white rounded-2xl p-6 border border-[oklch(0.88_0.008_240)] hover:shadow-lg transition-shadow h-full">
                  <div className="text-[oklch(0.40_0.11_195)] mb-4">{service.icon}</div>
                  <h3 className="font-[Outfit] font-700 text-[oklch(0.18_0.015_240)] mb-2">
                    {service.title}
                  </h3>
                  <div className="text-sm text-[oklch(0.52_0.015_240)] font-inter leading-relaxed">
                    {service.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <span className="section-tag">{t(language, 'home.whyChooseUs')}</span>
            <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mt-3">
              {t(language, 'home.financialAdvice')}
            </h2>
            <p className="text-[oklch(0.52_0.015_240)] font-inter mt-3 max-w-2xl mx-auto">
              {t(language, 'home.trustDesc')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyPoints.map((point, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-[oklch(0.40_0.11_195)] shrink-0 mt-0.5">{point.icon}</div>
                <div>
                  <h3 className="font-[Outfit] font-700 text-[oklch(0.18_0.015_240)] mb-1.5">
                    {point.title}
                  </h3>
                  <p className="text-sm text-[oklch(0.52_0.015_240)] font-inter leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <div className="text-center mb-14">
            <span className="section-tag">{t(language, 'home.clientStories')}</span>
            <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mt-3">
              {t(language, 'home.whatOurClients')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testi, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[oklch(0.88_0.008_240)]">
                <div className="flex gap-1 mb-4">
                  {[...Array(testi.rating)].map((_, j) => (
                    <Star key={j} size={16} className="fill-[oklch(0.76_0.19_75)] text-[oklch(0.76_0.19_75)]" />
                  ))}
                </div>
                <p className="text-[oklch(0.30_0.015_240)] font-inter text-sm leading-relaxed mb-4">
                  "{testi.text}"
                </p>
                <div>
                  <div className="font-[Outfit] font-semibold text-[oklch(0.18_0.015_240)]">
                    {testi.author}
                  </div>
                  <div className="text-xs text-[oklch(0.52_0.015_240)] font-inter">
                    {testi.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="teal-gradient py-16">
        <div className="container text-center">
          <h2 className="font-[Outfit] font-800 text-3xl text-white mb-4">
            {t(language, 'home.readySecure')}
          </h2>
          <p className="text-white/80 font-inter mb-7 max-w-md mx-auto">
            {t(language, 'home.readyDesc')}
          </p>
          <Link href="/contact" className="btn-amber">
            {t(language, 'nav.getQuote')} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
