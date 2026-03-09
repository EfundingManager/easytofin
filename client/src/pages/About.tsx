/* 
 * EasyToFin About Page — "Warm Expertise" design
 * Team photo, company story, values, regulatory info
 */
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Award, Users, Shield, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TEAM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663416267905/Dmr4obss8SQ94M9JEtE8y7/about-team-Y4XQMAH63T64YtEXuxPddb.webp";

const values = [
  {
    icon: <Shield size={22} />,
    title: "Integrity",
    desc: "We always act in your best interest. Our advice is honest, transparent and free from conflicts of interest.",
  },
  {
    icon: <Users size={22} />,
    title: "Client Focus",
    desc: "You are at the centre of everything we do. We listen, understand and tailor our advice to your unique situation.",
  },
  {
    icon: <Award size={22} />,
    title: "Expertise",
    desc: "Our team holds the highest professional qualifications and stays current with the latest financial regulations and products.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Long-Term Partnership",
    desc: "We build lasting relationships, reviewing your financial plan as your life evolves to ensure it always serves your goals.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="teal-gradient text-white py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white/90 text-xs font-[Outfit] font-600 uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
              About EasyToFin
            </span>
            <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-white mb-4 leading-tight">
              Your Trusted Financial Partner
            </h1>
            <p className="text-white/80 text-lg font-inter leading-relaxed max-w-2xl">
              EasyToFin Financial Services Limited is an independent financial services firm regulated by the Central Bank of Ireland. We provide expert, impartial advice across protection, pensions, health insurance, general insurance, mortgages and investments.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="section-tag">Our Story</span>
              <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mb-5">
                Built on Trust, Driven by Expertise
              </h2>
              <div className="space-y-4 text-[oklch(0.30_0.015_240)] font-inter text-base leading-relaxed">
                <p>
                  EasyToFin Financial Services Limited was founded with a simple mission: to make financial planning accessible, understandable and genuinely useful for every Irish household and business.
                </p>
                <p>
                  We believe that good financial advice should not be a luxury reserved for the wealthy. Whether you are a first-time buyer looking for a mortgage, a young family seeking life cover, or a business owner planning for retirement, we are here to help.
                </p>
                <p>
                  As an independent broker, we are not tied to any single product provider. This means our advice is always impartial — focused entirely on finding the solution that is right for you.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { value: "20+", label: "Years of Experience" },
                  { value: "5,000+", label: "Clients Served" },
                  { value: "100%", label: "Independent Advice" },
                  { value: "6", label: "Service Areas" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[oklch(0.97_0.003_240)] rounded-xl p-4 border border-[oklch(0.88_0.008_240)]">
                    <div className="font-[Outfit] font-800 text-2xl text-[oklch(0.40_0.11_195)]">{stat.value}</div>
                    <div className="text-sm text-[oklch(0.52_0.015_240)] font-inter mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src={TEAM_IMG}
                alt="EasyToFin team"
                className="rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-tag">Our Values</span>
            <h2 className="font-[Outfit] font-800 text-3xl text-[oklch(0.18_0.015_240)] mt-2">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[oklch(0.88_0.008_240)] shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-[oklch(0.93_0.04_195)] flex items-center justify-center mx-auto mb-4 text-[oklch(0.40_0.11_195)]">
                  {v.icon}
                </div>
                <h3 className="font-[Outfit] font-700 text-[oklch(0.18_0.015_240)] text-lg mb-2">{v.title}</h3>
                <p className="text-[oklch(0.52_0.015_240)] text-sm font-inter leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulatory */}
      <section className="py-16 bg-white border-t border-[oklch(0.88_0.008_240)]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-tag">Regulatory Information</span>
            <h2 className="font-[Outfit] font-700 text-2xl text-[oklch(0.18_0.015_240)] mt-2 mb-5">
              Regulated & Compliant
            </h2>
            <div className="bg-[oklch(0.97_0.003_240)] rounded-2xl p-8 border border-[oklch(0.88_0.008_240)] text-left space-y-3">
              {[
                "EasyToFin Financial Services Limited is regulated by the Central Bank of Ireland.",
                "We are authorised as a Multi-Agency Intermediary to provide advice on Life Assurance, Pensions, Investments and General Insurance.",
                "All advisors hold the relevant Qualified Financial Advisor (QFA) or equivalent qualifications.",
                "We maintain full Professional Indemnity Insurance as required by the Central Bank of Ireland.",
                "Our Terms of Business document is available on request and outlines our regulatory obligations to you.",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[oklch(0.40_0.11_195)] mt-0.5 shrink-0" />
                  <span className="text-[oklch(0.30_0.015_240)] text-sm font-inter">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="teal-gradient py-14">
        <div className="container text-center">
          <h2 className="font-[Outfit] font-800 text-3xl text-white mb-4">
            Let's Start a Conversation
          </h2>
          <p className="text-white/80 font-inter mb-7 max-w-md mx-auto">
            Get in touch with our team today for a free, no-obligation consultation.
          </p>
          <Link href="/contact" className="btn-amber">
            Contact Us <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
