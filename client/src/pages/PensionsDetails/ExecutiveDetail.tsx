import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ExecutiveDetail() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Executive Pension Plans</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Executive Pension Plans are designed specifically for company directors and senior executives. These plans offer higher contribution limits and greater flexibility than standard occupational pension schemes, making them ideal for business owners and key executives seeking to maximize retirement savings.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Executive plans are typically structured as defined contribution schemes with individual investment accounts, providing complete control over investment choices and retirement timing.
            </p>
          </div>

          {/* Key Aspects */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Aspects</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Higher Contribution Limits</h3>
                <p className="text-gray-700 text-sm">Executive plans allow contributions up to the annual allowance (€40,000 per year), with unused allowances carried forward for up to 4 years, enabling significant tax-efficient savings.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Individual Control</h3>
                <p className="text-gray-700 text-sm">Each executive has their own investment account with choice of investment funds, allowing personalized investment strategies based on individual risk tolerance.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Flexible Retirement</h3>
                <p className="text-gray-700 text-sm">Access your pension from age 60, with flexibility to take lump sums, purchase annuities, or establish an ARF based on your retirement needs.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Business Efficiency</h3>
                <p className="text-gray-700 text-sm">Employer contributions are tax-deductible for the business, and can be used as a flexible benefit tool for attracting and retaining key executives.</p>
              </div>
            </div>
          </div>

          {/* Tax Benefits */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Tax Benefits</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Maximized Tax Relief</h3>
                <p className="text-gray-700 text-sm">
                  Contributions receive full tax relief at your marginal rate (up to 40%), and can utilize the annual allowance of €40,000 per year, with unused allowances carried forward for 4 years.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Deductible Employer Contributions</h3>
                <p className="text-gray-700 text-sm">
                  Employer contributions are fully tax-deductible for the company and not treated as taxable income for the executive, making them an efficient remuneration tool.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Investment Growth</h3>
                <p className="text-gray-700 text-sm">
                  All investment returns within the plan are tax-free. No tax is paid on dividends, interest, or capital gains while your money is invested.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Lump Sum</h3>
                <p className="text-gray-700 text-sm">
                  At retirement, you can take up to 25% of your fund as a tax-free lump sum, with the remainder used for income or transferred to an ARF.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Company directors and business owners</li>
              <li>• Senior executives and key employees</li>
              <li>• High earners seeking to maximize retirement savings</li>
              <li>• Those wanting individual investment control</li>
              <li>• Businesses offering executive benefits packages</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              Executive Pension Plans are regulated by the Pensions Authority of Ireland and comply with all Irish pension regulations. Plans must have a trust deed and rules, with annual compliance reporting. We provide full administration, compliance, and member communication services. Tax relief is subject to annual allowance limits.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors about establishing an Executive Pension Plan for your business.
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
