import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PRSADetail() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Personal Retirement Savings Account (PRSA)</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A PRSA is a flexible, portable pension account designed for employees and self-employed individuals. It offers simplicity, portability, and tax relief on contributions, making it an ideal retirement savings solution for those who change jobs frequently or want a straightforward pension arrangement.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If your employer does not offer a workplace pension scheme, they are legally required to provide access to a standard PRSA under Irish pension regulations.
            </p>
          </div>

          {/* Key Aspects */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Aspects</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Flexibility</h3>
                <p className="text-gray-700 text-sm">You can contribute as much or as little as you wish, with no mandatory contribution requirements. Contributions can be adjusted at any time.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Portability</h3>
                <p className="text-gray-700 text-sm">Your PRSA moves with you between employers and jobs. There are no penalties for changing providers or transferring your account.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Investment Options</h3>
                <p className="text-gray-700 text-sm">Choose from a wide range of investment funds based on your risk tolerance and retirement timeline.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Accessibility</h3>
                <p className="text-gray-700 text-sm">Access your PRSA from age 60. You can take a tax-free lump sum (up to 25%) and purchase an annuity or access through an ARF.</p>
              </div>
            </div>
          </div>

          {/* Tax Benefits */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Tax Benefits</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax Relief on Contributions</h3>
                <p className="text-gray-700 text-sm">
                  You receive tax relief on your contributions at your marginal rate of taxation (up to 40% for higher earners). This means your contributions are made from pre-tax income, reducing your taxable income.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Growth</h3>
                <p className="text-gray-700 text-sm">
                  Your investment growth within the PRSA is tax-free. No tax is paid on dividends, interest, or capital gains while your money is invested.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Lump Sum</h3>
                <p className="text-gray-700 text-sm">
                  At retirement, you can take up to 25% of your PRSA fund as a tax-free lump sum. The remaining 75% can be used to purchase an annuity or transferred to an ARF.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Employer Contributions</h3>
                <p className="text-gray-700 text-sm">
                  If your employer contributes to your PRSA, these contributions are also tax-deductible for the employer and not treated as taxable income for you.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Employees without access to a workplace pension scheme</li>
              <li>• Self-employed professionals seeking retirement savings</li>
              <li>• Those who change jobs frequently</li>
              <li>• Anyone wanting a simple, portable pension solution</li>
              <li>• High earners wanting to maximize tax relief</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Pensions Authority of Ireland. All PRSAs comply with Irish pension regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Standard PRSAs are available from all pension providers at competitive rates.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right PRSA solution for your needs.
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
