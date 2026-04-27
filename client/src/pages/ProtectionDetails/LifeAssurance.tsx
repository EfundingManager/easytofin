import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LifeAssurance() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container">
          <Link href="/protection" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
            <ArrowLeft size={18} /> Back to Protection
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="container">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-blue-900 mb-2">
                Life Assurance
              </h1>
              <p className="text-lg text-blue-800">
                Comprehensive life insurance to protect your family's financial future
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          {/* Overview */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Life Assurance provides financial protection for your family in the event of your death. It ensures that your loved ones are financially secure and can maintain their standard of living, pay off debts, and cover essential expenses.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Whether you have dependents, a mortgage, or other financial obligations, life assurance is a crucial part of responsible financial planning.
            </p>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Family Protection", desc: "Ensure your family's financial security" },
                { title: "Mortgage Cover", desc: "Pay off your mortgage to protect your home" },
                { title: "Income Replacement", desc: "Replace lost income for dependents" },
                { title: "Flexible Terms", desc: "Choose coverage periods that suit your needs" },
                { title: "Affordable Premiums", desc: "Competitive rates for comprehensive cover" },
                { title: "Quick Payouts", desc: "Fast claim settlement for peace of mind" },
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                  <Check className="text-blue-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-700 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Who Needs It */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-4">Who Needs Life Assurance?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Parents with dependent children</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Homeowners with a mortgage</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Business owners with financial obligations</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Anyone with significant debts or financial responsibilities</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Individuals who want to leave a financial legacy</span>
              </li>
            </ul>
          </div>

          {/* Coverage Types */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Coverage Types</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Term Life Assurance</h3>
                <p className="text-gray-700">Coverage for a fixed period (e.g., 10, 20, or 30 years). Ideal for temporary needs like mortgage protection or raising children.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Whole of Life Assurance</h3>
                <p className="text-gray-700">Lifelong coverage with guaranteed payout. Provides permanent protection and can build cash value over time.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Decreasing Term Assurance</h3>
                <p className="text-gray-700">Coverage amount decreases over time, matching your reducing mortgage balance. Cost-effective mortgage protection.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="font-[Outfit] font-700 text-2xl text-gray-900 mb-4">
              Ready to Protect Your Family?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Get a personalized quote and speak with our expert advisors to find the right life assurance coverage for your needs.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Your Quote <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
