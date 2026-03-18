/* 
 * EasyToFin Navbar — "Elegant Prosperity" design with bilingual support
 * White background, Sage Green primary, Gold accents, integrated logo
 * Sticky top nav with dropdown for services + language switcher
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Phone, Mail, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416267905/Dmr4obss8SQ94M9JEtE8y7/pasted_file_zMR7uG_c21572416a1a566c2aac129c5ff4edc3_6bbffacd.jpg";

const getServices = (lang: 'en' | 'zh' | 'pl') => [
  { label: t(lang, 'services.protection'), href: "/protection", desc: t(lang, 'serviceDesc.protection') },
  { label: t(lang, 'services.pensions'), href: "/pensions", desc: t(lang, 'serviceDesc.pensions') },
  { label: t(lang, 'services.healthInsurance'), href: "/health-insurance", desc: t(lang, 'serviceDesc.healthInsurance') },
  { label: t(lang, 'services.generalInsurance'), href: "/general-insurance", desc: t(lang, 'serviceDesc.generalInsurance') },
  { label: t(lang, 'services.mortgages'), href: "/mortgages", desc: t(lang, 'serviceDesc.mortgages') },
  { label: t(lang, 'services.investments'), href: "/investments", desc: t(lang, 'serviceDesc.investments') },
];

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const services = getServices(language);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location]);

  return (
    <>
      {/* Top bar */}
      <div className="bg-[oklch(0.40_0.10_155)] text-white text-sm py-2 hidden md:block">
        <div className="container flex justify-between items-center">
          <span className="text-white/80 font-inter text-xs">{t(language, 'footer.regulatedCB')}</span>
          <div className="flex items-center gap-6">
            <a href="tel:+35312345678" className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
              <Phone size={13} />
              <span>+353 1 234 5678</span>
            </a>
            <a href="mailto:info@easytofin.ie" className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
              <Mail size={13} />
              <span>info@easytofin.ie</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          scrolled ? "shadow-md" : "border-b border-[oklch(0.92_0.02_155)]"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src={LOGO_URL} 
              alt="EasyToFin Logo" 
              className="h-10 w-auto object-contain group-hover:opacity-80 transition-opacity"
            />
            <div>
             <div className="font-[Outfit] font-semibold text-[oklch(0.25_0.06_155)] text-lg leading-tight">              EasyToFin
              </div>
              <div className="text-[10px] text-[oklch(0.52_0.015_155)] leading-tight tracking-wide uppercase font-inter">
                Financial Services
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="nav-link px-3 py-2 rounded-md hover:bg-[oklch(0.96_0.01_155)] transition-colors">
              {t(language, 'nav.home')}
            </Link>
            
            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="nav-link px-3 py-2 rounded-md hover:bg-[oklch(0.96_0.01_155)] transition-colors flex items-center gap-1">
                {t(language, 'nav.services')}
                <ChevronDown size={15} className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </button>
              
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[520px] bg-white rounded-xl shadow-xl border border-[oklch(0.92_0.02_155)] p-4 grid grid-cols-2 gap-2 z-50">
                  {services.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex flex-col p-3 rounded-lg hover:bg-[oklch(0.96_0.01_155)] transition-colors group"
                    >
                      <span className="font-[Outfit] font-semibold text-[oklch(0.25_0.06_155)] text-sm group-hover:text-[oklch(0.40_0.10_155)] transition-colors">
                        {s.label}
                      </span>
                      <span className="text-xs text-[oklch(0.52_0.015_155)] mt-0.5">{s.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" className="nav-link px-3 py-2 rounded-md hover:bg-[oklch(0.96_0.01_155)] transition-colors">
              {t(language, 'nav.aboutUs')}
            </Link>
            <Link href="/contact" className="nav-link px-3 py-2 rounded-md hover:bg-[oklch(0.96_0.01_155)] transition-colors">
              {t(language, 'nav.contact')}
            </Link>
          </div>

          {/* CTA + Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-[Outfit] font-semibold text-[oklch(0.40_0.10_155)] hover:bg-[oklch(0.92_0.02_155)] transition-colors"
              title={language === 'en' ? 'Switch to Chinese' : language === 'zh' ? 'Switch to Polish' : 'Switch to English'}
            >
              <Globe size={16} />
              <span className="text-xs">{language === 'en' ? '中文' : language === 'zh' ? 'PL' : 'EN'}</span>
            </button>
            <Link href="/contact" className="btn-gold text-sm px-5 py-2.5">
              {t(language, 'nav.getQuote')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-[oklch(0.25_0.06_155)] hover:bg-[oklch(0.96_0.01_155)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[oklch(0.92_0.02_155)] px-4 py-4 space-y-1">
            <Link href="/" className="block px-3 py-2.5 rounded-lg text-[oklch(0.25_0.06_155)] font-[Outfit] font-semibold hover:bg-[oklch(0.96_0.01_155)] transition-colors">
              {t(language, 'nav.home')}
            </Link>
            <div className="px-3 py-1.5 text-xs font-semibold font-[Outfit] text-[oklch(0.52_0.015_155)] uppercase tracking-wider">
              {t(language, 'nav.services')}
            </div>
            {services.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="block px-5 py-2 rounded-lg text-[oklch(0.25_0.06_155)] font-inter text-sm hover:bg-[oklch(0.96_0.01_155)] hover:text-[oklch(0.40_0.10_155)] transition-colors"
              >
                {s.label}
              </Link>
            ))}
            <Link href="/about" className="block px-3 py-2.5 rounded-lg text-[oklch(0.25_0.06_155)] font-[Outfit] font-semibold hover:bg-[oklch(0.96_0.01_155)] transition-colors">
              {t(language, 'nav.aboutUs')}
            </Link>
            <Link href="/contact" className="block px-3 py-2.5 rounded-lg text-[oklch(0.25_0.06_155)] font-[Outfit] font-semibold hover:bg-[oklch(0.96_0.01_155)] transition-colors">
              {t(language, 'nav.contact')}
            </Link>
            <div className="pt-2">
              <Link href="/contact" className="btn-gold w-full justify-center text-sm">
                {t(language, 'nav.getQuote')}
              </Link>
            </div>
            <div className="pt-2 border-t border-[oklch(0.92_0.02_155)] space-y-1">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm font-[Outfit] font-semibold text-[oklch(0.40_0.10_155)] w-full rounded-lg hover:bg-[oklch(0.92_0.02_155)] transition-colors"
              >
                <Globe size={16} />
                {language === 'en' ? '中文' : language === 'zh' ? 'PL' : 'EN'}
              </button>
              <a href="tel:+35312345678" className="flex items-center gap-2 px-3 py-2 text-sm text-[oklch(0.52_0.015_155)]">
                <Phone size={14} /> +353 1 234 5678
              </a>
              <a href="mailto:info@easytofin.ie" className="flex items-center gap-2 px-3 py-2 text-sm text-[oklch(0.52_0.015_155)]">
                <Mail size={14} /> info@easytofin.ie
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
