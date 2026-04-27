import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EducationSavingPlans() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Education Saving Plans</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Education Saving Plans are dedicated investment vehicles designed to help parents and guardians save for their children's future education expenses. These plans combine the power of long-term investing with tax-efficient growth, ensuring funds are available when education costs arise.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By investing through a qualified broker, you can build a substantial education fund while benefiting from professional investment management and tax advantages tailored to education savings.
            </p>
          </div>

          {/* Basic Explanation */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">What Are Education Saving Plans?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Education Saving Plans are structured investment accounts specifically created to accumulate funds for a child's education. Parents contribute regular or lump-sum amounts, which are invested in a diversified portfolio of funds selected based on the child's age and education timeline.
            </p>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Regular or lump-sum contributions to build education funds</li>
                  <li>• Automatic investment in age-appropriate fund portfolios</li>
                  <li>• Tax-efficient growth with deferred taxation on investment returns</li>
                  <li>• Professional fund management aligned with education timelines</li>
                  <li>• Flexible access to funds when education expenses arise</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">How Education Saving Plans Work</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">1. Plan Setup</h3>
                <p className="text-gray-700 text-sm">You open an Education Saving Plan with a broker, specifying your child's age and expected education start date. The broker recommends an appropriate investment strategy based on the time horizon.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2. Regular Contributions</h3>
                <p className="text-gray-700 text-sm">You contribute funds regularly (monthly, quarterly, or annually) or make lump-sum deposits. These contributions are invested according to your chosen strategy.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">3. Automatic Rebalancing</h3>
                <p className="text-gray-700 text-sm">As your child approaches education age, the portfolio automatically shifts from growth-focused investments to more conservative, capital-preservation investments to protect accumulated funds.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">4. Fund Withdrawal</h3>
                <p className="text-gray-700 text-sm">When education expenses arise, you can withdraw funds to cover tuition, accommodation, books, and other approved education costs. Withdrawals are typically tax-efficient.</p>
              </div>
            </div>
          </div>

          {/* Investment Goals */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Investment Goals Through a Broker</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Long-Term Growth</h3>
                <p className="text-gray-700 text-sm">Build substantial education funds through consistent investing over 10-18 years, leveraging compound growth and market returns to maximize accumulated capital.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Capital Preservation</h3>
                <p className="text-gray-700 text-sm">Automatically transition to lower-risk investments as education approaches, protecting accumulated funds from market volatility when funds are needed.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Tax Efficiency</h3>
                <p className="text-gray-700 text-sm">Benefit from tax-deferred growth and potential tax relief on contributions, maximizing net returns available for education expenses.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Disciplined Saving</h3>
                <p className="text-gray-700 text-sm">Establish a structured savings discipline through regular contributions, ensuring consistent progress toward education funding goals.</p>
              </div>
            </div>
          </div>

          {/* Investment Strategy Options */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Investment Strategy Options</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Age-Based Portfolios</h3>
                <p className="text-gray-700 text-sm">
                  Automatically adjust investment allocation based on your child's age. Younger children benefit from growth-focused strategies, while older children transition to conservative portfolios.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Custom Allocation</h3>
                <p className="text-gray-700 text-sm">
                  Choose your own asset allocation across stocks, bonds, and cash based on your risk tolerance and education timeline. Adjust as needed to match your preferences.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Target-Date Funds</h3>
                <p className="text-gray-700 text-sm">
                  Invest in target-date funds that automatically rebalance as your child's education date approaches, simplifying portfolio management.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Parents and guardians planning for children's education</li>
              <li>• Those seeking tax-efficient education savings vehicles</li>
              <li>• Families wanting disciplined, automatic savings programs</li>
              <li>• Anyone with 5-18 year education planning horizons</li>
              <li>• Parents seeking professional investment management for education funds</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              Education Saving Plans are regulated by the Central Bank of Ireland and comply with all Irish investment regulations. Broker services are authorized and supervised. Tax treatment of education savings depends on individual circumstances and current tax legislation. Past performance is not indicative of future results. Investment returns are not guaranteed and capital can fluctuate. Withdrawals for non-education purposes may have tax implications.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Start an Education Saving Plan
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our investment advisors to set up an education savings plan for your child's future.
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
