import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccidentSickness() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Accident & Sickness Cover</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Accident & Sickness Cover provides short-term income replacement if you're unable to work due to an accident or sickness. It pays a weekly benefit, helping you cover essential expenses while you recover.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This cover is particularly valuable for self-employed individuals and business owners who don't have access to employer sick pay schemes.
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Waiting Period</h3>
                <p className="text-gray-700 text-sm">Typically 7, 14, or 28 days before benefits commence. Longer waiting periods result in lower premiums.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Weekly Benefit</h3>
                <p className="text-gray-700 text-sm">Fixed weekly amount paid if you're unable to work. You choose the benefit level when taking out the policy.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Maximum Duration</h3>
                <p className="text-gray-700 text-sm">Benefits typically paid for up to 52 weeks per claim, with annual limits on total claims.</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Weekly cash benefits during incapacity</li>
              <li>• Short-term income replacement (up to 52 weeks)</li>
              <li>• Covers both accident and sickness</li>
              <li>• Flexible waiting periods (7, 14, or 28 days)</li>
              <li>• Affordable premiums for comprehensive cover</li>
              <li>• Ideal for self-employed professionals</li>
            </ul>
          </div>

          {/* Who Needs It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Needs It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Self-employed professionals without sick pay</li>
              <li>• Business owners and entrepreneurs</li>
              <li>• Freelancers and contractors</li>
              <li>• Employees with limited sick pay entitlements</li>
              <li>• Anyone wanting short-term income protection</li>
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
