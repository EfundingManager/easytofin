import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AVCsDetail() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Additional Voluntary Contributions (AVCs)</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Additional Voluntary Contributions (AVCs) allow you to make extra contributions to your existing occupational pension scheme beyond your regular employee contributions. AVCs are designed to help you boost your retirement savings and maximize your pension fund.
            </p>
            <p className="text-gray-700 leading-relaxed">
              AVCs are particularly valuable for those who want to catch up on pension savings, maximize tax relief, or build a larger retirement fund without changing their main pension scheme.
            </p>
          </div>

          {/* Key Aspects */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Aspects</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Supplementary to Main Scheme</h3>
                <p className="text-gray-700 text-sm">AVCs work alongside your existing occupational pension, allowing you to build additional retirement savings without disrupting your main scheme.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Flexible Contributions</h3>
                <p className="text-gray-700 text-sm">You can choose how much to contribute to your AVCs based on your financial situation. Contributions can be adjusted or paused at any time.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Investment Control</h3>
                <p className="text-gray-700 text-sm">Select from a range of investment options to match your risk profile and retirement timeline.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Retirement Flexibility</h3>
                <p className="text-gray-700 text-sm">At retirement, your AVC fund can be used to purchase an annuity, transferred to an ARF, or taken as a lump sum (subject to tax rules).</p>
              </div>
            </div>
          </div>

          {/* Tax Benefits */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Tax Benefits</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Full Tax Relief on Contributions</h3>
                <p className="text-gray-700 text-sm">
                  You receive tax relief at your marginal rate (up to 40%) on all AVC contributions. This effectively reduces your taxable income and increases your retirement savings.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Investment Growth</h3>
                <p className="text-gray-700 text-sm">
                  Your AVC fund grows tax-free. No tax is paid on dividends, interest, or capital gains while your money is invested.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contribution Limits</h3>
                <p className="text-gray-700 text-sm">
                  You can contribute up to the annual allowance (currently €40,000 per year) to all pension schemes combined. Unused allowances can be carried forward for up to 4 years.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Lump Sum</h3>
                <p className="text-gray-700 text-sm">
                  At retirement, you can take up to 25% of your AVC fund as a tax-free lump sum, with the remainder used for income or transferred to an ARF.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Employees wanting to boost their occupational pension</li>
              <li>• Those who want to maximize tax relief on contributions</li>
              <li>• High earners seeking additional retirement savings</li>
              <li>• Individuals catching up on pension savings</li>
              <li>• Those planning early retirement</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              AVCs are regulated by the Pensions Authority of Ireland and comply with all Irish pension regulations. Your employer's pension scheme must offer AVCs for you to participate. A full product information document (IPID) is available upon request. Tax relief is subject to annual allowance limits.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to maximize your AVC contributions and retirement savings.
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
