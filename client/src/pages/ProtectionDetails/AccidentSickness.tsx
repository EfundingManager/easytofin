import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccidentSickness() {
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
      <section className="py-16 bg-gradient-to-r from-yellow-50 to-yellow-100">
        <div className="container">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-yellow-600 text-white rounded-lg">
              <AlertCircle size={32} />
            </div>
            <div>
              <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-yellow-900 mb-2">
                Accident & Sickness Cover
              </h1>
              <p className="text-lg text-yellow-800">
                Short-term protection for accidents and sickness-related absences
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
              Accident & Sickness Cover provides short-term income replacement if you're unable to work due to an accident or illness. It bridges the gap between your sick leave and longer-term income protection, ensuring you maintain your income during temporary absences.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              This cover is particularly valuable for those without generous sick pay or who need immediate income support during recovery periods.
            </p>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Quick Payouts", desc: "Fast claim processing and benefit payments" },
                { title: "Short-Term Cover", desc: "Typically covers 12-52 weeks of absence" },
                { title: "Flexible Waiting Periods", desc: "Choose 1, 2, 4, or 8 weeks" },
                { title: "Accident & Illness", desc: "Coverage for both accidents and sickness" },
                { title: "Affordable Premiums", desc: "Cost-effective short-term protection" },
                { title: "Easy Claims", desc: "Simple claim process with minimal paperwork" },
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 bg-yellow-50 rounded-lg">
                  <Check className="text-yellow-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-700 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What's Covered */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">What's Covered</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-600 pl-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Accidents</h3>
                <p className="text-gray-700">Injuries from accidents, whether at work or outside work (subject to policy terms).</p>
              </div>
              <div className="border-l-4 border-yellow-600 pl-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Illness</h3>
                <p className="text-gray-700">Any sickness or disease that prevents you from working, including mental health conditions.</p>
              </div>
              <div className="border-l-4 border-yellow-600 pl-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Hospitalization</h3>
                <p className="text-gray-700">Additional benefits if you require hospital treatment.</p>
              </div>
              <div className="border-l-4 border-yellow-600 pl-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Rehabilitation</h3>
                <p className="text-gray-700">Support and guidance to help you return to work safely.</p>
              </div>
            </div>
          </div>

          {/* Who Needs It */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-4">Who Needs This Cover?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Employees with limited or no sick pay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Self-employed professionals</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Manual workers at higher risk of accidents</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Anyone who can't afford to lose income during temporary absence</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Those seeking short-term protection before longer-term cover kicks in</span>
              </li>
            </ul>
          </div>

          {/* Benefit Periods */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Benefit Periods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { period: "12 Weeks", desc: "Short-term cover for minor absences" },
                { period: "26 Weeks", desc: "6-month protection for longer recovery" },
                { period: "39 Weeks", desc: "Extended cover for serious conditions" },
                { period: "52 Weeks", desc: "Full year protection" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.period}</h4>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How Claims Work */}
          <div className="mb-16">
            <h2 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">How Claims Work</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Report Your Absence", desc: "Notify your insurer as soon as you're unable to work" },
                { step: "2", title: "Provide Evidence", desc: "Submit medical certificates or documentation" },
                { step: "3", title: "Claim Assessment", desc: "Your claim is reviewed and verified" },
                { step: "4", title: "Benefit Payment", desc: "Receive your benefit payment after waiting period" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-600 text-white rounded-full font-bold shrink-0">
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
          <div className="bg-yellow-50 rounded-xl p-8 text-center">
            <h3 className="font-[Outfit] font-700 text-2xl text-gray-900 mb-4">
              Protect Your Income During Absence
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Get a personalized quote for accident and sickness cover tailored to your needs.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors">
              Get Your Quote <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
