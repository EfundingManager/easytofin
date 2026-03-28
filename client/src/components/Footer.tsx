/* 
 * EasyToFin Footer — "Warm Expertise" design with bilingual support
 * Dark teal background, clean layout, regulatory info
 */
import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook, Linkedin, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

const getServices = (lang: 'en' | 'zh' | 'pl') => [
  { label: t(lang, 'services.protection'), href: "/protection" },
  { label: t(lang, 'services.pensions'), href: "/pensions" },
  { label: t(lang, 'services.healthInsurance'), href: "/health-insurance" },
  { label: t(lang, 'services.generalInsurance'), href: "/general-insurance" },
  { label: t(lang, 'services.mortgages'), href: "/mortgages" },
  { label: t(lang, 'services.investments'), href: "/investments" },
];

const getCompany = (lang: 'en' | 'zh' | 'pl') => [
  { label: t(lang, 'nav.aboutUs'), href: "/about" },
  { label: t(lang, 'common.contactUs'), href: "/contact" },
];

export default function Footer() {
  const { language } = useLanguage();
  const services = getServices(language);
  const company = getCompany(language);

  return (
    <footer className="bg-[oklch(0.22_0.07_195)] text-white">
      {/* Main footer */}
      <div className="container py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663416267905/Dmr4obss8SQ94M9JEtE8y7/pasted_file_vPhGVo_截屏2026-03-1810.38.12_5ed1a528.png" 
              alt="EasyToFin Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="font-[Outfit] font-bold text-white text-lg leading-tight">EasyToFin</div>
              <div className="text-[10px] text-white/60 leading-tight tracking-wide uppercase">Financial Services</div>
            </div>
          </Link>
          <p className="text-white/70 text-sm leading-relaxed mb-5">
            {t(language, 'footer.tagline')}
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[oklch(0.76_0.19_75)] hover:text-[oklch(0.15_0.02_30)] transition-colors">
              <Facebook size={15} />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[oklch(0.76_0.19_75)] hover:text-[oklch(0.15_0.02_30)] transition-colors">
              <Linkedin size={15} />
            </a>
            <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[oklch(0.76_0.19_75)] hover:text-[oklch(0.15_0.02_30)] transition-colors">
              <Twitter size={15} />
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-[Outfit] font-semibold text-white text-sm uppercase tracking-wider mb-4">{t(language, 'footer.ourServices')}</h4>
          <ul className="space-y-2.5">
            {services.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-white/65 text-sm hover:text-[oklch(0.76_0.19_75)] transition-colors">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-[Outfit] font-semibold text-white text-sm uppercase tracking-wider mb-4">{t(language, 'footer.company')}</h4>
          <ul className="space-y-2.5">
            {company.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="text-white/65 text-sm hover:text-[oklch(0.76_0.19_75)] transition-colors">
                  {c.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="#" className="text-white/65 text-sm hover:text-[oklch(0.76_0.19_75)] transition-colors">
                {t(language, 'footer.privacyPolicy')}
              </a>
            </li>
            <li>
              <a href="#" className="text-white/65 text-sm hover:text-[oklch(0.76_0.19_75)] transition-colors">
                {t(language, 'footer.termsOfBusiness')}
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-[Outfit] font-semibold text-white text-sm uppercase tracking-wider mb-4">{t(language, 'footer.contactUs')}</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-white/70 text-sm">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[oklch(0.76_0.19_75)]" />
              <span>EasyToFin Financial Services Limited<br />Ireland</span>
            </li>
            <li>
              <a href="tel:+35312345678" className="flex items-center gap-2.5 text-white/70 text-sm hover:text-[oklch(0.76_0.19_75)] transition-colors">
                <Phone size={15} className="shrink-0 text-[oklch(0.76_0.19_75)]" />
                +353 1 234 5678
              </a>
            </li>
            <li>
              <a href="mailto:info@easytofin.ie" className="flex items-center gap-2.5 text-white/70 text-sm hover:text-[oklch(0.76_0.19_75)] transition-colors">
                <Mail size={15} className="shrink-0 text-[oklch(0.76_0.19_75)]" />
                info@easytofin.ie
              </a>
            </li>
          </ul>
          <div className="mt-5">
            <Link href="/contact" className="btn-amber text-sm px-5 py-2.5 inline-flex">
              {t(language, 'nav.getQuote')}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <p>{t(language, 'footer.copyright').replace('{year}', new Date().getFullYear().toString())}</p>
          <p className="text-center md:text-right">
            {t(language, 'footer.regulatedCB')}
          </p>
        </div>
      </div>
    </footer>
  );
}
