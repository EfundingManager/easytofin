import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const healthProducts = [
  {
    title: "Individual Health Insurance",
    description: "Comprehensive private health coverage for individuals with choice of hospitals and consultants.",
    href: "/health-insurance/individual",
  },
  {
    title: "Family Health Insurance",
    description: "Affordable health coverage for families with benefits for all family members.",
    href: "/health-insurance/family",
  },
  {
    title: "Group Health Insurance",
    description: "Employee health benefits for businesses providing comprehensive workplace health coverage.",
    href: "/health-insurance/group",
  },
  {
    title: "Senior Health Insurance",
    description: "Specialized health coverage designed for retirees and seniors over 65.",
    href: "/health-insurance/senior",
  },
];

export default function HealthInsurance() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-teal-50 to-teal-100">
        <div className="container">
          <h1 className="font-[Outfit] font-700 text-4xl md:text-5xl text-teal-900 mb-4">
            Health Insurance
          </h1>
          <p className="text-lg text-teal-800 max-w-2xl">
            Access quality healthcare with private health insurance plans tailored to your needs.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="font-[Outfit] font-600 text-2xl text-gray-900 mb-12">Our Health Insurance Plans</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthProducts.map((product) => (
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
