import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Briefcase } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function IncomeProtection() {
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
      <section className="py-16 bg-gradient-to-r from-green-50 to-green-100">
        <div className="container">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-green-600 text-white rounded-lg">
              <Briefcase size={32} />
            </div>
            <div>
              <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-green-900 mb-2">
                Income Protection
              </h1>
              <p className="text-lg text-green-800">
                Replace your income if you're unable to work due to illness or injury
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
              Income Protection Insurance replaces a percentage of your income if you're unable to work due to illness or injury. It provides financial security and allows you to focus on recovery without worrying about bills and living expenses.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Whether you're employed or self-employed, income protection ensures you can maintain your standard of living during periods when you can't work.
            </p>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Income Replacement", desc: "Replace up to 60-70% of your salary" },
                { title: "Long-Term Security", desc: "Protection until retirement age if needed" },
                { title: "Flexible Waiting Periods", desc: "Choose 4, 8, 13, 26, or 52 weeks" },
                { title: "Increasing Benefit", desc: "Benefit increases with inflation" },
                { title: "Rehabilitation Support", desc: "Help returning to work" },
                { title: "Affordable Premiums", desc: "Competitive rates for comprehensive cover" },
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 bg-green-50 rounded-lg">
                  <Check className="text-green-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-700 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coverage Details */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Coverage Details</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Waiting Period</h3>
                <p className="text-gray-700">The time between becoming unable to work and receiving benefits. Shorter waiting periods have higher premiums.</p>
              </div>
              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Benefit Period</h3>
                <p className="text-gray-700">How long benefits are paid – typically until age 60, 65, or for a fixed period (e.g., 2, 5, or 10 years).</p>
              </div>
              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Benefit Amount</h3>
                <p className="text-gray-700">Usually 50-70% of your gross income, depending on your occupation and underwriting.</p>
              </div>
              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Definition of Disability</h3>
                <p className="text-gray-700">Varies by policy – either "unable to perform your own occupation" or "unable to perform any occupation".</p>
              </div>
            </div>
          </div>

          {/* Who Needs It */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-4">Who Needs Income Protection?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>Self-employed professionals without sick pay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>Employees with limited sick pay entitlements</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>High earners wanting to maintain their lifestyle</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>Business owners who need to protect their business</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>Anyone with significant financial obligations</span>
              </li>
            </ul>
          </div>

          {/* Waiting Periods Explained */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Waiting Periods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { period: "4 Weeks", desc: "Highest premium, quickest benefits" },
                { period: "8 Weeks", desc: "Balanced option, moderate premium" },
                { period: "13 Weeks", desc: "Lower premium, longer wait" },
                { period: "26 Weeks", desc: "Lowest premium, 6-month wait" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.period}</h4>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-green-50 rounded-xl p-8 text-center">
            <h3 className="font-[Outfit] font-700 text-2xl text-gray-900 mb-4">
              Protect Your Income Today
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Get a personalized quote and find out how income protection can secure your financial future.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Get Your Quote <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
