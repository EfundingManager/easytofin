import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PersonalAccident() {
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
      <section className="py-16 bg-gradient-to-r from-purple-50 to-purple-100">
        <div className="container">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-600 text-white rounded-lg">
              <Users size={32} />
            </div>
            <div>
              <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-purple-900 mb-2">
                Personal Accident Plan
              </h1>
              <p className="text-lg text-purple-800">
                Comprehensive accident coverage for you and your family
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
              A Personal Accident Plan provides comprehensive protection against accidental injuries for you and your family members. It covers medical expenses, disability benefits, and financial assistance following accidents, whether at home, work, or during leisure activities.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              This plan complements your other insurance by providing specific accident-related benefits and ensuring your family is protected against unexpected accidents.
            </p>
          </div>

          {/* Coverage Types */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Coverage Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Death Benefit", desc: "Lump sum paid to beneficiaries if death results from accident" },
                { title: "Permanent Disability", desc: "Compensation for permanent loss of limbs or sight" },
                { title: "Temporary Disability", desc: "Weekly income replacement during recovery" },
                { title: "Medical Expenses", desc: "Reimbursement for accident-related medical treatment" },
                { title: "Hospital Benefit", desc: "Daily allowance for hospitalization" },
                { title: "Rehabilitation", desc: "Support for physical therapy and recovery" },
              ].map((coverage, i) => (
                <div key={i} className="flex gap-4 p-4 bg-purple-50 rounded-lg">
                  <Check className="text-purple-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{coverage.title}</h3>
                    <p className="text-gray-700 text-sm">{coverage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Coverage */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Family Coverage</h2>
            <p className="text-gray-700 mb-6">
              Personal Accident Plans can be extended to cover your entire family:
            </p>
            <div className="space-y-4">
              {[
                { member: "Spouse", coverage: "Full coverage under the plan" },
                { member: "Children", coverage: "Coverage up to age 18 or 25 if in full-time education" },
                { member: "Dependents", coverage: "Extended family members living with you" },
                { member: "Domestic Help", coverage: "Optional coverage for household staff" },
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-purple-600 pl-6 pb-4">
                  <h3 className="font-semibold text-gray-900">{item.member}</h3>
                  <p className="text-gray-700">{item.coverage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What's Covered */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">What's Covered</h2>
            <div className="space-y-3 text-gray-700">
              <p className="flex gap-3">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Accidents at home, work, or during leisure activities</span>
              </p>
              <p className="flex gap-3">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Road accidents and motor vehicle incidents</span>
              </p>
              <p className="flex gap-3">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Sports and recreational activities</span>
              </p>
              <p className="flex gap-3">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Travel-related accidents (worldwide coverage available)</span>
              </p>
              <p className="flex gap-3">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Emergency medical treatment</span>
              </p>
              <p className="flex gap-3">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Rehabilitation and recovery support</span>
              </p>
            </div>
          </div>

          {/* Exclusions */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Common Exclusions</h2>
            <div className="space-y-3 text-gray-700">
              <p className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Accidents while under the influence of alcohol or drugs</span>
              </p>
              <p className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Professional sports or hazardous activities (unless declared)</span>
              </p>
              <p className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Accidents resulting from illegal activities</span>
              </p>
              <p className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Pre-existing medical conditions (unless specifically covered)</span>
              </p>
              <p className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Accidents occurring in countries with travel warnings</span>
              </p>
            </div>
          </div>

          {/* Who Needs It */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-4">Who Needs This Plan?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <span>Families with active lifestyles and outdoor activities</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <span>Parents wanting to protect their children</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <span>Individuals engaged in sports or recreational activities</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <span>Frequent travelers</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <span>Anyone wanting comprehensive accident protection</span>
              </li>
            </ul>
          </div>

          {/* Benefit Examples */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Benefit Examples</h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Loss of Limb</h4>
                <p className="text-gray-700">€50,000 - €100,000 depending on which limb</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Loss of Sight</h4>
                <p className="text-gray-700">€50,000 - €100,000 depending on one or both eyes</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Accidental Death</h4>
                <p className="text-gray-700">€100,000 - €500,000 lump sum to beneficiaries</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Temporary Disability</h4>
                <p className="text-gray-700">€100 - €500 per week during recovery</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-purple-50 rounded-xl p-8 text-center">
            <h3 className="font-[Outfit] font-700 text-2xl text-gray-900 mb-4">
              Protect Your Family Against Accidents
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Get a personalized quote for personal accident cover that protects you and your family.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Get Your Quote <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
