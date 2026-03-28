/* 
 * EasyToFin About Page — "Warm Expertise" design with bilingual support
 * Team photo, company story, values, regulatory info
 */
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Award, Users, Shield, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

const TEAM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416267905/Dmr4obss8SQ94M9JEtE8y7/about-team-Y4XQMAH63T64YtEXuxPddb.webp";

const getValues = (lang: 'en' | 'zh' | 'pl') => [
  {
    icon: <Shield size={22} />,
    title: t(lang, 'why.integrity'),
    desc: t(lang, 'why.integrityDesc'),
  },
  {
    icon: <Users size={22} />,
    title: t(lang, 'why.clientFocus'),
    desc: t(lang, 'why.clientFocusDesc'),
  },
  {
    icon: <Award size={22} />,
    title: t(lang, 'why.expertise'),
    desc: t(lang, 'why.expertiseDesc'),
  },
  {
    icon: <TrendingUp size={22} />,
    title: t(lang, 'why.partnership'),
    desc: t(lang, 'why.partnershipDesc'),
  },
];

export default function About() {
  const { language } = useLanguage();
  const values = getValues(language);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="teal-gradient text-white py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white/90 text-xs font-[Outfit] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
              {t(language, 'about.aboutEasyToFin')}
            </span>
            <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-white mb-4 leading-tight">
              {t(language, 'about.trustedPartner')}
            </h1>
            <p className="text-white/80 text-lg font-inter leading-relaxed max-w-2xl">
              {t(language, 'about.heroDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="section-tag">{t(language, 'about.ourStory')}</span>
              <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mb-5">
                {t(language, 'about.builtOnTrust')}
              </h2>
              <div className="space-y-4 text-[oklch(0.30_0.015_240)] font-inter text-base leading-relaxed">
                <p>{t(language, 'about.p1')}</p>
                <p>{t(language, 'about.p2')}</p>
                <p>{t(language, 'about.p3')}</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { value: "20+", label: t(language, 'about.yearsExp') },
                  { value: "5,000+", label: t(language, 'about.clientsServed') },
                  { value: "100%", label: t(language, 'about.independent') },
                  { value: "6", label: t(language, 'about.services') },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[oklch(0.97_0.003_240)] border border-[oklch(0.88_0.008_240)]">
                    <div className="font-[Outfit] font-800 text-2xl text-[oklch(0.40_0.11_195)]">
                      {stat.value}
                    </div>
                    <div className="text-xs text-[oklch(0.52_0.015_240)] mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={TEAM_IMG} alt={language === 'en' ? "EasyToFin team" : "EasyToFin团队"} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <div className="text-center mb-14">
            <span className="section-tag">{t(language, 'about.ourValues')}</span>
            <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mt-3">
              {t(language, 'about.whatWeStand')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-[oklch(0.88_0.008_240)]">
                <div className="text-[oklch(0.40_0.11_195)] mb-3">
                  {value.icon}
                </div>
                <h3 className="font-[Outfit] font-700 text-[oklch(0.18_0.015_240)] mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-[oklch(0.52_0.015_240)] font-inter leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulatory */}
      <section className="py-16 bg-white border-t border-[oklch(0.88_0.008_240)]">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className="font-[Outfit] font-800 text-2xl text-[oklch(0.18_0.015_240)] mb-4">
              {t(language, 'about.regulated')}
            </h2>
            <p className="text-[oklch(0.30_0.015_240)] font-inter leading-relaxed mb-4">
              {t(language, 'about.regulatedDesc')}
            </p>
            <div className="bg-[oklch(0.97_0.003_240)] rounded-lg p-6 border border-[oklch(0.88_0.008_240)]">
              <p className="text-sm text-[oklch(0.52_0.015_240)] font-inter">
                {t(language, 'about.regulationInfo')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="teal-gradient py-14">
        <div className="container text-center">
          <h2 className="font-[Outfit] font-800 text-3xl text-white mb-4">
            {t(language, 'common.readyGetStarted')}
          </h2>
          <p className="text-white/80 font-inter mb-7 max-w-md mx-auto">
            {t(language, 'common.readyDesc')}
          </p>
          <Link href="/contact" className="btn-amber">
            {t(language, 'nav.contact')} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
