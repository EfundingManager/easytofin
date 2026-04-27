import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pensionProducts = [
  {
    title: "Personal Retirement Savings Account (PRSA)",
    description: "A PRSA (Personal Retirement Savings Account) is a flexible, tax-efficient retirement solution that gives you access to a range of investment funds. If your employer does not offer a company pension scheme, they are legally required to provide access to a standard PRSA.",
    href: "/pensions/prsa",
  },
  {
    title: "Additional Voluntary Contributions (AVCs)",
    description: "Top up your existing occupational pension to maximise your retirement fund and take full advantage of available tax relief on contributions.",
    href: "/pensions/avcs",
  },
  {
    title: "Occupational Pension Schemes",
    description: "Employer-sponsored pension arrangements that allow both employer and employee contributions. We advise both employers on scheme design and employees on maximising their benefits.",
    href: "/pensions/occupational",
  },
  {
    title: "Executive Pension Plans",
    description: "Designed for company directors and senior executives, offering higher contribution limits and greater flexibility than standard occupational pension schemes.",
    href: "/pensions/executive",
  },
  {
    title: "Approved Retirement Fund (ARF)",
    description: "An ARF lets you invest your remaining pension after taking your lump sum, with tax-efficient growth. Minimum withdrawals apply from age 61, which can be drawn as a DMF.",
    href: "/pensions/arf",
  },
];

export default function Pensions() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-teal-50 to-teal-100">
        <div className="container">
          <h1 className="font-[Outfit] font-700 text-4xl md:text-5xl text-teal-900 mb-4">
            Pensions & Retirement Planning
          </h1>
          <p className="text-lg text-teal-800 max-w-2xl">
            Secure your financial future with comprehensive pension solutions tailored to your needs.
          </p>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="font-[Outfit] font-600 text-2xl text-gray-900 mb-12">What We Offer</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pensionProducts.map((product) => (
              <div key={product.href} className="border-2 border-teal-200 rounded-lg p-6 hover:border-teal-600 hover:shadow-lg transition-all h-full flex flex-col">
                <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-3 border-b-4 border-teal-600 pb-2 inline-block">
                  {product.title}
                </h3>
                <p className="text-gray-700 text-sm mb-6 flex-grow leading-relaxed">{product.description}</p>
                <Link href={product.href} className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors">
                  Learn more <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
