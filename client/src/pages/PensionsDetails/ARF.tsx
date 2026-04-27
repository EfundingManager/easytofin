import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ARF() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">ARF (Approved Retirement Funds)</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              An Approved Retirement Fund (ARF) is a flexible retirement savings vehicle that allows you to manage your pension investments and drawdowns after retirement. It provides maximum flexibility in how and when you access your retirement funds.
            </p>
            <p className="text-gray-700 leading-relaxed">
              ARFs are ideal for those who want to maintain investment control and flexibility in retirement, rather than purchasing an annuity for fixed income.
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Establishment</h3>
                <p className="text-gray-700 text-sm">You transfer your pension fund into an ARF at retirement. You can take up to 25% as a tax-free lump sum.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Investment Management</h3>
                <p className="text-gray-700 text-sm">You choose how your ARF is invested, maintaining control over your portfolio and asset allocation.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Flexible Drawdowns</h3>
                <p className="text-gray-700 text-sm">You can withdraw funds as needed, subject to tax. No mandatory retirement age limits.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Inheritance</h3>
                <p className="text-gray-700 text-sm">Your ARF can be passed to beneficiaries, providing flexibility for estate planning.</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Maximum flexibility in retirement income</li>
              <li>• Complete investment control</li>
              <li>• Tax-free lump sum option (25%)</li>
              <li>• No mandatory retirement age</li>
              <li>• Flexible drawdown schedule</li>
              <li>• Inheritance benefits for beneficiaries</li>
            </ul>
          </div>

          {/* Who Needs It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Needs It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Retirees wanting investment flexibility</li>
              <li>• Those preferring flexible income drawdowns</li>
              <li>• High-net-worth individuals with large pension pots</li>
              <li>• Anyone wanting to maintain investment control in retirement</li>
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
