import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PersonalPensions() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container">
          <Link href="/pensions" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Personal Pensions</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Personal pensions are self-directed retirement savings plans designed for self-employed professionals and business owners. You have complete control over your contributions, investment choices, and retirement benefits.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Personal pensions offer flexibility and tax efficiency, allowing you to build a substantial retirement fund tailored to your specific needs and circumstances.
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Setup</h3>
                <p className="text-gray-700 text-sm">You establish a personal pension plan and choose your investment provider and strategy.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Contributions</h3>
                <p className="text-gray-700 text-sm">You make regular contributions from your business or personal income. Tax relief is available on qualifying contributions.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Investment Control</h3>
                <p className="text-gray-700 text-sm">You choose how your pension is invested across various asset classes and funds.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Retirement Access</h3>
                <p className="text-gray-700 text-sm">From age 60 onwards, you can access your pension fund flexibly or take an annuity for guaranteed income.</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Complete control over contributions and investments</li>
              <li>• Tax relief on contributions (up to 40%)</li>
              <li>• Flexible contribution schedule</li>
              <li>• Wide range of investment options</li>
              <li>• Portable and transferable</li>
              <li>• Death benefits for beneficiaries</li>
            </ul>
          </div>

          {/* Who Needs It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Needs It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Self-employed professionals and contractors</li>
              <li>• Business owners without workplace schemes</li>
              <li>• Those seeking investment control</li>
              <li>• High earners wanting tax-efficient retirement planning</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Pensions Authority of Ireland. All schemes comply with Irish pension regulations and consumer protection requirements. A full product information document (IPID) is available upon request.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right pension solution for your needs.
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
