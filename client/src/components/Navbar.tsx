/*
 * EasyToFin Navbar — "Elegant Prosperity" design with trilingual support
 * Deep Forest Green primary, Gold accents, integrated logo
 * Sticky top nav with dropdown for services + improved language switcher dropdown
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Phone, Mail, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416267905/Dmr4obss8SQ94M9JEtE8y7/pasted_file_vPhGVo_截屏2026-03-1810.38.12_5ed1a528.png";

const LANGUAGE_OPTIONS = [
  { code: 'en' as const, label: 'English', nativeLabel: 'English' },
  { code: 'zh' as const, label: 'Chinese', nativeLabel: '中文' },
  { code: 'pl' as const, label: 'Polish', nativeLabel: 'Polski' },
];

const getServices = (lang: 'en' | 'zh' | 'pl') => [
  { label: t(lang, 'services.protection'), href: "/protection", desc: t(lang, 'serviceDesc.protection') },
  { label: t(lang, 'services.pensions'), href: "/pensions", desc: t(lang, 'serviceDesc.pensions') },
  { label: t(lang, 'services.healthInsurance'), href: "/health-insurance", desc: t(lang, 'serviceDesc.healthInsurance') },
  { label: t(lang, 'services.generalInsurance'), href: "/general-insurance", desc: t(lang, 'serviceDesc.generalInsurance') },

  { label: t(lang, 'services.investments'), href: "/investments", desc: t(lang, 'serviceDesc.investments') },
];

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const services = getServices(language);
  const currentLanguage = LANGUAGE_OPTIONS.find(l => l.code === language);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setLanguageDropdownOpen(false);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-language-dropdown]')) {
        setLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-[oklch(0.40_0.10_155)] text-white text-sm py-2 hidden md:block">
        <div className="container flex justify-between items-center">
          <span className="text-white/80 font-inter text-xs">{t(language, 'footer.regulatedCB')}</span>
          <div className="flex items-center gap-6">
            <a href="tel:+35312345678" className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
              <Phone size={13} />
              <span className="text-xs">+353 1 234 5678</span>
            </a>
            <a href="mailto:info@easytofin.com" className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
              <Mail size={13} />
              <span className="text-xs">info@easytofin.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`sticky top-0 z-40 w-full transition-all duration-200 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <div className="container flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src={LOGO_URL} 
              alt="EasyToFin Logo" 
              className="h-14 w-auto object-contain group-hover:opacity-80 transition-opacity"
            />
            <span className="hidden sm:inline text-[oklch(0.25_0.06_155)] font-[Outfit] font-bold text-2xl tracking-wide">EasyToFin</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="nav-link px-3 py-2 rounded-md text-[oklch(0.25_0.06_155)] font-[Outfit] font-semibold hover:bg-[oklch(0.96_0.01_155)] transition-colors text-xl">
              {t(language, 'nav.home')}
            </Link>

            {/* Services dropdown */}
            <div className="relative group">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-[oklch(0.25_0.06_155)] font-[Outfit] font-semibold hover:bg-[oklch(0.96_0.01_155)] transition-colors text-xl"
              >
                {t(language, 'nav.services')}
                <ChevronDown size={14} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
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

            <Link href="/about" className="nav-link px-3 py-2 rounded-md text-[oklch(0.25_0.06_155)] font-[Outfit] font-semibold hover:bg-[oklch(0.96_0.01_155)] transition-colors text-xl">
              {t(language, 'nav.aboutUs')}
            </Link>
            <Link href="/contact" className="nav-link px-3 py-2 rounded-md text-[oklch(0.25_0.06_155)] font-[Outfit] font-semibold hover:bg-[oklch(0.96_0.01_155)] transition-colors text-xl">
              {t(language, 'nav.contact')}
            </Link>
          </div>

          {/* CTA + Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative" data-language-dropdown>
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-[Outfit] font-semibold text-[oklch(0.40_0.10_155)] hover:bg-[oklch(0.96_0.01_155)] transition-colors border border-transparent hover:border-[oklch(0.92_0.02_155)]"
              >
                <Globe size={16} />
                <span className="text-base">{currentLanguage?.nativeLabel}</span>
                <ChevronDown size={14} className={`transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-[oklch(0.92_0.02_155)] py-2 z-50">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLanguageDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-inter transition-colors ${
                        language === lang.code
                          ? 'bg-[oklch(0.96_0.01_155)] text-[oklch(0.40_0.10_155)] font-semibold'
                          : 'text-[oklch(0.25_0.06_155)] hover:bg-[oklch(0.98_0.01_155)]'
                      }`}
                    >
                      <span className="text-base">{lang.code === 'en' ? '🇬🇧' : lang.code === 'zh' ? '🇨🇳' : '🇵🇱'}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{lang.nativeLabel}</span>
                        <span className="text-xs text-[oklch(0.52_0.015_155)]">{lang.label}</span>
                      </div>
                      {language === lang.code && (
                        <span className="ml-auto text-[oklch(0.40_0.10_155)]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/contact" className="btn-gold text-base px-5 py-2.5">
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
              <div className="px-3 py-1.5 text-xs font-semibold font-[Outfit] text-[oklch(0.52_0.015_155)] uppercase tracking-wider">
                {t(language, 'nav.language')}
              </div>
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-[Outfit] font-semibold rounded-lg transition-colors ${
                    language === lang.code
                      ? 'bg-[oklch(0.96_0.01_155)] text-[oklch(0.40_0.10_155)]'
                      : 'text-[oklch(0.25_0.06_155)] hover:bg-[oklch(0.96_0.01_155)]'
                  }`}
                >
                  <span className="text-base">{lang.code === 'en' ? '🇬🇧' : lang.code === 'zh' ? '🇨🇳' : '🇵🇱'}</span>
                  <span>{lang.nativeLabel}</span>
                  {language === lang.code && <span className="ml-auto">✓</span>}
                </button>
              ))}
              <a href="tel:+35312345678" className="flex items-center gap-2 px-3 py-2 text-sm text-[oklch(0.52_0.015_155)]">
                <Phone size={14} /> +353 1 234 5678
              </a>
              <a href="mailto:info@easytofin.com" className="flex items-center gap-2 px-3 py-2 text-sm text-[oklch(0.52_0.015_155)]">
                <Mail size={14} /> info@easytofin.com
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
