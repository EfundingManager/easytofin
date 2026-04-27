import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SavingsPlans() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container">
          <Link href="/investments" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Savings Plans</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Savings Plans offer a structured approach to building wealth through regular contributions and investment growth. Designed for individuals seeking to accumulate savings over time with professional fund management and tax-efficient strategies.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Choose from flexible contribution levels, multiple investment funds, and customizable timescales. Our savings plans combine the discipline of regular saving with the growth potential of investment markets.
            </p>
          </div>

          {/* Investment Options */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Investment Options</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Balanced Funds</h3>
                <p className="text-gray-700 text-sm">Mixed portfolio of stocks and bonds providing moderate growth with lower volatility. Suitable for medium-term savers seeking balanced risk-return profiles.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Growth Funds</h3>
                <p className="text-gray-700 text-sm">Equity-focused portfolio targeting higher returns through stock market investment. Suitable for longer-term savers with higher risk tolerance.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Conservative Funds</h3>
                <p className="text-gray-700 text-sm">Capital preservation focus with bonds and fixed-income securities. Suitable for cautious savers prioritizing stability over growth.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Managed Funds</h3>
                <p className="text-gray-700 text-sm">Professionally managed portfolios that automatically adjust risk as you approach your savings goal. Ideal for hands-off investors.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Ethical Funds</h3>
                <p className="text-gray-700 text-sm">Investment in companies meeting environmental, social, and governance (ESG) criteria. For investors with ethical investment preferences.</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Features</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Contributions</h3>
                <p className="text-gray-700 text-sm">
                  Set your own contribution level from as little as €50 per month. Increase, decrease, or pause contributions as your circumstances change.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Efficient Growth</h3>
                <p className="text-gray-700 text-sm">
                  Investment growth is tax-free within the plan. No tax on dividends or capital gains while your money is invested, maximizing compound growth.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Professional Management</h3>
                <p className="text-gray-700 text-sm">
                  Our expert fund managers actively manage your investments, making strategic decisions to optimize returns within your chosen risk profile.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Regular Reviews</h3>
                <p className="text-gray-700 text-sm">
                  Annual performance reviews and rebalancing ensure your portfolio remains aligned with your goals and risk tolerance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexibility at Maturity</h3>
                <p className="text-gray-700 text-sm">
                  At the end of your savings term, choose to take your funds as a lump sum, transfer to another investment, or continue saving.
                </p>
              </div>
            </div>
          </div>

          {/* Risk Profiles */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Risk Profiles</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Conservative (Low Risk)</h3>
                <p className="text-gray-700 text-sm">Prioritizes capital preservation with minimal volatility. Expected returns 2-4% annually. Suitable for short-term savers (1-3 years).</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Balanced (Medium Risk)</h3>
                <p className="text-gray-700 text-sm">Mix of growth and stability with moderate volatility. Expected returns 4-6% annually. Suitable for medium-term savers (3-7 years).</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Growth (High Risk)</h3>
                <p className="text-gray-700 text-sm">Focuses on capital growth with higher volatility. Expected returns 6-8%+ annually. Suitable for long-term savers (7+ years).</p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Individuals seeking structured savings with investment growth</li>
              <li>• Those saving for medium to long-term goals (5+ years)</li>
              <li>• People wanting professional fund management</li>
              <li>• Savers seeking tax-efficient investment vehicles</li>
              <li>• Anyone wanting to build wealth through regular contributions</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All savings plans comply with Irish investment regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Past performance is not indicative of future results. Investment returns are not guaranteed and capital can fluctuate.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Start Saving Today
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our investment advisors to find the right savings plan for your financial goals.
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
