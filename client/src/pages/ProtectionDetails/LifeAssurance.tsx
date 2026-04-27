import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDetailPageTranslation } from "@/lib/allDetailTranslations";

export default function LifeAssurance() {
  const { language } = useLanguage();
  const translation = getDetailPageTranslation('lifeAssurance', language as 'en' | 'zh' | 'pl');
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button & Language Switcher */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container flex justify-between items-center">
          <Link href="/services/protection" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> {language === 'en' ? 'Back' : language === 'zh' ? '返回' : 'Wróć'}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">{translation?.title || 'Life Assurance'}</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">{language === 'en' ? 'Overview' : language === 'zh' ? '概述' : 'Przegląd'}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {translation?.overview || 'Life Assurance provides financial protection for your family in the event of your death. It ensures that your loved ones are financially secure and can maintain their standard of living, pay off debts, and cover essential expenses.'}
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you have dependents, a mortgage, or other financial obligations, life assurance is a crucial part of responsible financial planning.
            </p>
          </div>

          {/* Coverage Types */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Types</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Term Life Assurance</h3>
                <p className="text-gray-700 text-sm">Coverage for a fixed period (10, 20, or 30 years). Ideal for temporary needs like mortgage protection or raising children.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Whole of Life Assurance</h3>
                <p className="text-gray-700 text-sm">Lifelong coverage with guaranteed payout. Provides permanent protection and can build cash value over time.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Decreasing Term Assurance</h3>
                <p className="text-gray-700 text-sm">Coverage amount decreases over time, matching your reducing mortgage balance. Cost-effective mortgage protection.</p>
              </div>
            </div>
          </div>

          {/* Who Needs It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Needs It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Parents with dependent children</li>
              <li>• Homeowners with a mortgage</li>
              <li>• Business owners with financial obligations</li>
              <li>• Anyone with significant debts or financial responsibilities</li>
            </ul>
          </div>

          {/* Key Features */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Family protection and financial security</li>
              <li>• Mortgage cover to protect your home</li>
              <li>• Income replacement for dependents</li>
              <li>• Flexible coverage periods and amounts</li>
              <li>• Affordable premiums for comprehensive cover</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All policies comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right coverage for your needs.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-teal-700 transition-colors">
              Contact Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
