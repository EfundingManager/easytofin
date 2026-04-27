import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SeriousIllness() {
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
      <section className="py-16 bg-gradient-to-r from-red-50 to-red-100">
        <div className="container">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-600 text-white rounded-lg">
              <Heart size={32} />
            </div>
            <div>
              <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-red-900 mb-2">
                Specified Serious Illness Cover
              </h1>
              <p className="text-lg text-red-800">
                Protection against critical illnesses with guaranteed lump sum payouts
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
              Specified Serious Illness Cover provides a lump sum payment if you're diagnosed with a specified critical illness. This financial support helps you focus on recovery without worrying about bills, treatment costs, or lost income.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Unlike income protection that replaces lost earnings, serious illness cover provides a single, tax-free lump sum that you can use for any purpose – medical treatment, debt repayment, or living expenses.
            </p>
          </div>

          {/* Covered Illnesses */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Covered Illnesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Cancer (specified types)",
                "Heart attack",
                "Stroke",
                "Coronary artery bypass",
                "Kidney failure",
                "Liver failure",
                "Alzheimer's disease",
                "Parkinson's disease",
                "Multiple sclerosis",
                "Motor neurone disease",
                "Blindness",
                "Deafness",
              ].map((illness, i) => (
                <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-lg">
                  <Check className="text-red-600 shrink-0" size={20} />
                  <span className="text-gray-700">{illness}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Key Benefits</h2>
            <div className="space-y-6">
              {[
                { title: "Lump Sum Payment", desc: "Receive a tax-free lump sum immediately upon diagnosis" },
                { title: "Financial Security", desc: "Peace of mind knowing you're protected against critical illness" },
                { title: "Flexible Use", desc: "Use the money for treatment, debt, or living expenses" },
                { title: "Affordable Premiums", desc: "Competitive rates for comprehensive critical illness protection" },
                { title: "Guaranteed Payout", desc: "Specified illnesses are clearly defined and guaranteed" },
                { title: "Partial Recovery Benefit", desc: "Some policies offer partial payouts for less severe conditions" },
              ].map((benefit, i) => (
                <div key={i} className="border-l-4 border-red-600 pl-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Who Needs It */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-4">Who Needs This Cover?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">•</span>
                <span>Anyone with financial dependents or responsibilities</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">•</span>
                <span>Self-employed individuals without sick pay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">•</span>
                <span>Business owners who need to protect their business</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">•</span>
                <span>High earners who want to maintain their lifestyle during recovery</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">•</span>
                <span>Anyone concerned about the financial impact of serious illness</span>
              </li>
            </ul>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">How It Works</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Purchase Cover", desc: "Choose your coverage amount and policy term" },
                { step: "2", title: "Pay Premiums", desc: "Regular monthly or annual premium payments" },
                { step: "3", title: "Get Diagnosed", desc: "If diagnosed with a specified illness, notify your insurer" },
                { step: "4", title: "Receive Payment", desc: "Get your lump sum payment within days of approval" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full font-bold shrink-0">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-700">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-red-50 rounded-xl p-8 text-center">
            <h3 className="font-[Outfit] font-700 text-2xl text-gray-900 mb-4">
              Protect Against Critical Illness
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Get a personalized quote and learn how serious illness cover can protect your financial future.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Get Your Quote <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
