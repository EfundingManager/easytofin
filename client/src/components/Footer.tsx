/* 
 * EasyToFin Footer — "Warm Expertise" design
 * Dark teal background, clean layout, regulatory info
 */
import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook, Linkedin, Twitter } from "lucide-react";

const services = [
  { label: "Protection", href: "/protection" },
  { label: "Pensions", href: "/pensions" },
  { label: "Health Insurance", href: "/health-insurance" },
  { label: "General Insurance", href: "/general-insurance" },
  { label: "Mortgages", href: "/mortgages" },
  { label: "Investments", href: "/investments" },
];

const company = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.22_0.07_195)] text-white">
      {/* Main footer */}
      <div className="container py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[oklch(0.76_0.19_75)] flex items-center justify-center text-[oklch(0.15_0.02_30)] font-bold text-lg font-[Outfit]">
              E
            </div>
            <div>
              <div className="font-[Outfit] font-bold text-white text-lg leading-tight">EasyToFin</div>
              <div className="text-[10px] text-white/60 leading-tight tracking-wide uppercase">Financial Services</div>
            </div>
          </Link>
          <p className="text-white/70 text-sm leading-relaxed mb-5">
            Expert financial advice tailored to your needs. Protecting and planning for your future since day one.
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
          <h4 className="font-[Outfit] font-600 text-white text-sm uppercase tracking-wider mb-4">Our Services</h4>
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
          <h4 className="font-[Outfit] font-600 text-white text-sm uppercase tracking-wider mb-4">Company</h4>
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
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-white/65 text-sm hover:text-[oklch(0.76_0.19_75)] transition-colors">
                Terms of Business
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-[Outfit] font-600 text-white text-sm uppercase tracking-wider mb-4">Contact Us</h4>
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
              Get a Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} EasyToFin Financial Services Limited. All rights reserved.</p>
          <p className="text-center md:text-right">
            EasyToFin Financial Services Limited is regulated by the Central Bank of Ireland.
          </p>
        </div>
      </div>
    </footer>
  );
}
