/* 
 * EasyToFin Home Page — "Warm Expertise" design
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

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416267905/Dmr4obss8SQ94M9JEtE8y7/hero-banner-DQ43hiRTQkWyHmsrFp5TGz.webp";
const TEAM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416267905/Dmr4obss8SQ94M9JEtE8y7/about-team-Y4XQMAH63T64YtEXuxPddb.webp";

const services = [
  {
    icon: <Shield size={26} />,
    title: "Protection",
    desc: "Life assurance, serious illness cover, income protection and more — safeguard what matters most.",
    href: "/protection",
    color: "oklch(0.93_0.04_195)",
    iconColor: "oklch(0.40_0.11_195)",
  },
  {
    icon: <TrendingUp size={26} />,
    title: "Pensions",
    desc: "Personal pensions, occupational schemes, ARFs, PRSAs — plan the retirement you deserve.",
    href: "/pensions",
    color: "oklch(0.95_0.03_155)",
    iconColor: "oklch(0.38_0.12_155)",
  },
  {
    icon: <Heart size={26} />,
    title: "Health Insurance",
    desc: "Private medical insurance plans for individuals, families and businesses across all budgets.",
    href: "/health-insurance",
    color: "oklch(0.95_0.03_25)",
    iconColor: "oklch(0.55_0.18_25)",
  },
  {
    icon: <Building2 size={26} />,
    title: "General Insurance",
    desc: "Home, motor, business and liability insurance — comprehensive cover at competitive rates.",
    href: "/general-insurance",
    color: "oklch(0.95_0.03_280)",
    iconColor: "oklch(0.45_0.14_280)",
  },
  {
    icon: <HomeIcon size={26} />,
    title: "Mortgages",
    desc: "First-time buyer, mover or remortgage — we guide you from application to drawdown.",
    href: "/mortgages",
    color: "oklch(0.95_0.04_75)",
    iconColor: "oklch(0.55_0.16_75)",
  },
  {
    icon: <BarChart3 size={26} />,
    title: "Investments",
    desc: "Savings plans, investment bonds and portfolio management to grow your wealth over time.",
    href: "/investments",
    color: "oklch(0.95_0.03_195)",
    iconColor: "oklch(0.40_0.11_195)",
  },
];

const whyPoints = [
  {
    icon: <CheckCircle2 size={22} />,
    title: "Independent & Impartial",
    desc: "We work for you, not the insurance companies. Our advice is always in your best interest.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "Regulated & Trusted",
    desc: "EasyToFin Financial Services Limited is fully regulated by the Central Bank of Ireland.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "Expert Advisors",
    desc: "Our qualified team brings years of experience across all areas of financial planning.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "Tailored Solutions",
    desc: "No two clients are the same. We build a plan that fits your unique circumstances and goals.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "Whole of Market Access",
    desc: "We compare products from Ireland's leading providers to find you the best value.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "Ongoing Support",
    desc: "We're here for the long term — reviewing your cover as your life changes.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Dublin",
    text: "EasyToFin made the whole process of getting life insurance so straightforward. They found us a great policy at a price we could afford.",
    stars: 5,
  },
  {
    name: "James O'Brien",
    location: "Cork",
    text: "Brilliant service from start to finish. The pension advice was clear, honest and genuinely helpful. Highly recommended.",
    stars: 5,
  },
  {
    name: "Aoife K.",
    location: "Galway",
    text: "Got our mortgage protection sorted quickly and hassle-free. The team was professional and very responsive.",
    stars: 5,
  },
];

export default function Home() {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[580px] md:min-h-[640px] flex items-center overflow-hidden">
        <img
          src={HERO_IMG}
          alt="EasyToFin financial advisors meeting with clients"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.22_0.07_195)/0.92] via-[oklch(0.22_0.07_195)/0.75] to-[oklch(0.22_0.07_195)/0.20]" />
        <div className="relative container py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[oklch(0.76_0.19_75)]"></span>
              <span className="text-white/90 text-sm font-inter">Regulated by the Central Bank of Ireland</span>
            </div>
            <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
              Your Financial<br />
              <span className="text-[oklch(0.76_0.19_75)]">Future, Simplified.</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 font-inter max-w-xl">
              EasyToFin Financial Services provides expert, independent advice on protection, pensions, health insurance, mortgages and investments — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-amber text-base px-7 py-3.5">
                Get a Free Quote <ArrowRight size={18} />
              </Link>
              <Link href="/about" className="flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/25 text-white rounded-lg font-[Outfit] font-600 text-base hover:bg-white/20 transition-colors">
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-10">
              {[
                { value: "20+", label: "Years Experience" },
                { value: "5,000+", label: "Happy Clients" },
                { value: "100%", label: "Independent Advice" },
              ].map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className="font-[Outfit] font-800 text-2xl text-white">{stat.value}</div>
                  <div className="text-white/65 text-xs font-inter mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-tag">Our Services</span>
            <h2 className="font-[Outfit] font-800 text-3xl md:text-4xl text-[oklch(0.18_0.015_240)] mt-2 mb-3">
              Everything You Need, In One Place
            </h2>
            <p className="text-[oklch(0.52_0.015_240)] max-w-xl mx-auto font-inter text-base">
              From protecting your family today to planning your retirement tomorrow — we cover every stage of your financial life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <Link key={s.href} href={s.href} className="service-card group block">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: s.color, color: s.iconColor }}
                >
                  {s.icon}
                </div>
                <h3 className="font-[Outfit] font-700 text-xl text-[oklch(0.18_0.015_240)] mb-2 group-hover:text-[oklch(0.40_0.11_195)] transition-colors">
                  {s.title}
                </h3>
                <p className="text-[oklch(0.52_0.015_240)] text-sm leading-relaxed font-inter mb-4">{s.desc}</p>
                <span className="flex items-center gap-1.5 text-[oklch(0.40_0.11_195)] text-sm font-[Outfit] font-600 group-hover:gap-2.5 transition-all">
                  Learn more <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why EasyToFin */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="section-tag">Why Choose Us</span>
              <h2 className="font-[Outfit] font-800 text-3xl md:text-4xl text-[oklch(0.18_0.015_240)] mt-2 mb-4">
                Financial Advice You Can Trust
              </h2>
              <p className="text-[oklch(0.52_0.015_240)] font-inter text-base leading-relaxed mb-8">
                At EasyToFin, we believe everyone deserves clear, honest financial guidance. Our independent advisors take the time to understand your situation and find solutions that genuinely work for you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whyPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[oklch(0.40_0.11_195)] mt-0.5 shrink-0">{p.icon}</span>
                    <div>
                      <div className="font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] text-sm mb-0.5">{p.title}</div>
                      <div className="text-[oklch(0.52_0.015_240)] text-xs font-inter leading-relaxed">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src={TEAM_IMG}
                alt="EasyToFin team of financial advisors"
                className="rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg p-4 border border-[oklch(0.88_0.008_240)]">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[oklch(0.76_0.19_75)] text-[oklch(0.76_0.19_75)]" />
                  ))}
                </div>
                <div className="font-[Outfit] font-700 text-[oklch(0.18_0.015_240)] text-sm">5.0 / 5.0</div>
                <div className="text-xs text-[oklch(0.52_0.015_240)] font-inter">Based on 200+ client reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-tag">Client Stories</span>
            <h2 className="font-[Outfit] font-800 text-3xl md:text-4xl text-[oklch(0.18_0.015_240)] mt-2">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[oklch(0.88_0.008_240)] shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={16} className="fill-[oklch(0.76_0.19_75)] text-[oklch(0.76_0.19_75)]" />
                  ))}
                </div>
                <p className="text-[oklch(0.30_0.015_240)] text-sm leading-relaxed font-inter mb-5 italic">
                  "{t.text}"
                </p>
                <div>
                  <div className="font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] text-sm">{t.name}</div>
                  <div className="text-xs text-[oklch(0.52_0.015_240)] font-inter">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="teal-gradient py-16">
        <div className="container text-center">
          <h2 className="font-[Outfit] font-800 text-3xl md:text-4xl text-white mb-4">
            Ready to Secure Your Financial Future?
          </h2>
          <p className="text-white/80 font-inter text-base max-w-xl mx-auto mb-8">
            Book a free, no-obligation consultation with one of our expert advisors today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-amber text-base px-8 py-3.5">
              Get a Free Quote <ArrowRight size={18} />
            </Link>
            <a href="tel:+35312345678" className="flex items-center gap-2 px-8 py-3.5 bg-white/10 border border-white/25 text-white rounded-lg font-[Outfit] font-600 text-base hover:bg-white/20 transition-colors">
              <Phone size={18} /> Call Us Now
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
