/* 
 * EasyToFin Navbar — "Warm Expertise" design
 * Deep teal primary, clean white background, Outfit font
 * Sticky top nav with dropdown for services
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Phone, Mail } from "lucide-react";

const services = [
  { label: "Protection", href: "/protection", desc: "Life, illness & income cover" },
  { label: "Pensions", href: "/pensions", desc: "Plan your retirement" },
  { label: "Health Insurance", href: "/health-insurance", desc: "Private medical cover" },
  { label: "General Insurance", href: "/general-insurance", desc: "Home, car & business" },
  { label: "Mortgages", href: "/mortgages", desc: "Buy your home" },
  { label: "Investments", href: "/investments", desc: "Grow your wealth" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

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
      <div className="bg-[oklch(0.32_0.09_195)] text-white text-sm py-2 hidden md:block">
        <div className="container flex justify-between items-center">
          <span className="text-white/80 font-inter text-xs">Regulated by the Central Bank of Ireland</span>
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
          scrolled ? "shadow-md" : "border-b border-[oklch(0.88_0.008_240)]"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[oklch(0.40_0.11_195)] flex items-center justify-center text-white font-bold text-lg font-[Outfit] group-hover:bg-[oklch(0.32_0.09_195)] transition-colors">
              E
            </div>
            <div>
              <div className="font-[Outfit] font-bold text-[oklch(0.18_0.015_240)] text-lg leading-tight">
                EasyToFin
              </div>
              <div className="text-[10px] text-[oklch(0.52_0.015_240)] leading-tight tracking-wide uppercase font-inter">
                Financial Services
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="nav-link px-3 py-2 rounded-md hover:bg-[oklch(0.97_0.003_240)] transition-colors">
              Home
            </Link>
            
            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="nav-link px-3 py-2 rounded-md hover:bg-[oklch(0.97_0.003_240)] transition-colors flex items-center gap-1">
                Services
                <ChevronDown size={15} className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </button>
              
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[520px] bg-white rounded-xl shadow-xl border border-[oklch(0.88_0.008_240)] p-4 grid grid-cols-2 gap-2 z-50">
                  {services.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex flex-col p-3 rounded-lg hover:bg-[oklch(0.97_0.003_240)] transition-colors group"
                    >
                      <span className="font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] text-sm group-hover:text-[oklch(0.40_0.11_195)] transition-colors">
                        {s.label}
                      </span>
                      <span className="text-xs text-[oklch(0.52_0.015_240)] mt-0.5">{s.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" className="nav-link px-3 py-2 rounded-md hover:bg-[oklch(0.97_0.003_240)] transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="nav-link px-3 py-2 rounded-md hover:bg-[oklch(0.97_0.003_240)] transition-colors">
              Contact
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/contact" className="btn-amber text-sm px-5 py-2.5">
              Get a Quote
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-[oklch(0.30_0.015_240)] hover:bg-[oklch(0.97_0.003_240)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[oklch(0.88_0.008_240)] px-4 py-4 space-y-1">
            <Link href="/" className="block px-3 py-2.5 rounded-lg text-[oklch(0.18_0.015_240)] font-[Outfit] font-500 hover:bg-[oklch(0.97_0.003_240)] transition-colors">
              Home
            </Link>
            <div className="px-3 py-1.5 text-xs font-600 font-[Outfit] text-[oklch(0.52_0.015_240)] uppercase tracking-wider">
              Services
            </div>
            {services.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="block px-5 py-2 rounded-lg text-[oklch(0.30_0.015_240)] font-inter text-sm hover:bg-[oklch(0.97_0.003_240)] hover:text-[oklch(0.40_0.11_195)] transition-colors"
              >
                {s.label}
              </Link>
            ))}
            <Link href="/about" className="block px-3 py-2.5 rounded-lg text-[oklch(0.18_0.015_240)] font-[Outfit] font-500 hover:bg-[oklch(0.97_0.003_240)] transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="block px-3 py-2.5 rounded-lg text-[oklch(0.18_0.015_240)] font-[Outfit] font-500 hover:bg-[oklch(0.97_0.003_240)] transition-colors">
              Contact
            </Link>
            <div className="pt-2">
              <Link href="/contact" className="btn-amber w-full justify-center text-sm">
                Get a Quote
              </Link>
            </div>
            <div className="pt-2 border-t border-[oklch(0.88_0.008_240)] space-y-1">
              <a href="tel:+35312345678" className="flex items-center gap-2 px-3 py-2 text-sm text-[oklch(0.52_0.015_240)]">
                <Phone size={14} /> +353 1 234 5678
              </a>
              <a href="mailto:info@easytofin.ie" className="flex items-center gap-2 px-3 py-2 text-sm text-[oklch(0.52_0.015_240)]">
                <Mail size={14} /> info@easytofin.ie
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
