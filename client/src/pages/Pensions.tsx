import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pensionProducts = [
  {
    title: "Workplace Pensions",
    description: "Employer-sponsored pension schemes providing retirement savings with employer contributions.",
    href: "/pensions/workplace",
  },
  {
    title: "Personal Pensions",
    description: "Self-directed pension plans for self-employed professionals and business owners.",
    href: "/pensions/personal",
  },
  {
    title: "ARF (Approved Retirement Funds)",
    description: "Flexible retirement fund allowing you to manage your pension investments and drawdowns.",
    href: "/pensions/arf",
  },
  {
    title: "PRSA (Personal Retirement Savings Account)",
    description: "Flexible, portable pension account with tax relief on contributions.",
    href: "/pensions/prsa",
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

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="font-[Outfit] font-600 text-2xl text-gray-900 mb-12">Our Pension Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pensionProducts.map((product) => (
              <Link key={product.href} href={product.href}>
                <div className="border-2 border-teal-200 rounded-lg p-6 hover:border-teal-600 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  <h3 className="font-[Outfit] font-600 text-xl text-gray-900 mb-3 border-b-4 border-teal-600 pb-2 inline-block">
                    {product.title}
                  </h3>
                  <p className="text-gray-700 mb-6 flex-grow">{product.description}</p>
                  <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm">
                    Learn more <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
