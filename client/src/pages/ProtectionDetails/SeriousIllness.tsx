import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SeriousIllness() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container">
          <Link href="/protection" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Specified Serious Illness Cover</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Specified Serious Illness Cover provides a tax-free lump sum payment if you're diagnosed with a specified critical illness. This financial support helps you focus on recovery without worrying about bills, treatment costs, or lost income.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Unlike income protection that replaces lost earnings, serious illness cover provides a single lump sum that you can use for any purpose – medical treatment, debt repayment, or living expenses.
            </p>
          </div>

          {/* Covered Conditions */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Covered Conditions</h2>
            <div className="grid grid-cols-2 gap-3 text-gray-700 text-sm">
              <div>• Cancer (specified types)</div>
              <div>• Heart attack</div>
              <div>• Stroke</div>
              <div>• Coronary artery bypass</div>
              <div>• Kidney failure</div>
              <div>• Liver failure</div>
              <div>• Alzheimer's disease</div>
              <div>• Parkinson's disease</div>
              <div>• Multiple sclerosis</div>
              <div>• Motor neurone disease</div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Benefits</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Tax-free lump sum payment upon diagnosis</li>
              <li>• Financial security during recovery</li>
              <li>• Flexible use of funds for any purpose</li>
              <li>• Affordable premiums for comprehensive cover</li>
              <li>• Clearly defined covered conditions</li>
            </ul>
          </div>

          {/* Who Needs It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Needs It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Anyone with financial dependents or responsibilities</li>
              <li>• Self-employed professionals without sick pay</li>
              <li>• Business owners needing to protect their business</li>
              <li>• High earners wanting to maintain their lifestyle</li>
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
