import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PortfolioManagement() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Portfolio Management</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Portfolio Management service provides comprehensive investment advice and active management of your investment portfolio. Our experienced advisors work with you to develop a personalized investment strategy aligned with your financial goals, risk tolerance, and time horizon.
            </p>
            <p className="text-gray-700 leading-relaxed">
              From portfolio construction and ongoing monitoring to rebalancing and tax optimization, we handle all aspects of managing your investments so you can focus on your life.
            </p>
          </div>

          {/* Services Offered */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Services Offered</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Portfolio Construction</h3>
                <p className="text-gray-700 text-sm">Develop a customized portfolio based on your goals, risk profile, and investment preferences. We build diversified portfolios across asset classes and geographies.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Ongoing Monitoring</h3>
                <p className="text-gray-700 text-sm">Regular review of portfolio performance and market conditions. We track your investments against benchmarks and adjust as needed.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Rebalancing</h3>
                <p className="text-gray-700 text-sm">Maintain your target asset allocation through periodic rebalancing. Sell outperformers and buy underperformers to keep your portfolio on track.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Tax Optimization</h3>
                <p className="text-gray-700 text-sm">Implement tax-efficient strategies including tax-loss harvesting and strategic fund placement to minimize your tax liability.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Retirement Planning</h3>
                <p className="text-gray-700 text-sm">Develop comprehensive retirement strategies including pension planning, drawdown strategies, and income generation from your portfolio.</p>
              </div>
            </div>
          </div>

          {/* Management Strategies */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Management Strategies</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Active Management</h3>
                <p className="text-gray-700 text-sm">
                  Our fund managers actively select investments and make tactical adjustments to outperform market benchmarks. Includes regular rebalancing and opportunistic trading.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Passive Management</h3>
                <p className="text-gray-700 text-sm">
                  Track market indices through low-cost index funds. Provides broad market exposure with minimal trading and lower fees than active management.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Hybrid Approach</h3>
                <p className="text-gray-700 text-sm">
                  Combine active and passive strategies for optimal results. Use index funds for core holdings and active managers for tactical opportunities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Risk Management</h3>
                <p className="text-gray-700 text-sm">
                  Implement diversification and hedging strategies to manage downside risk. Adjust portfolio risk as you approach your investment goals.
                </p>
              </div>
            </div>
          </div>

          {/* Advisory Levels */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Advisory Levels</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Advisory Service</h3>
                <p className="text-gray-700 text-sm">Receive personalized recommendations and advice. You make the final investment decisions. Suitable for experienced investors.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Discretionary Management</h3>
                <p className="text-gray-700 text-sm">We manage your portfolio on your behalf within agreed parameters. Full discretion to make investment decisions without consulting you on each trade.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Wealth Planning</h3>
                <p className="text-gray-700 text-sm">Comprehensive financial planning including investments, tax, estate planning, and retirement strategy. Holistic approach to wealth management.</p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• High-net-worth individuals seeking professional management</li>
              <li>• Those with complex financial situations requiring expert advice</li>
              <li>• Busy professionals wanting hands-off portfolio management</li>
              <li>• People planning for retirement or major life events</li>
              <li>• Anyone wanting to optimize their investment strategy and tax position</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This service is regulated by the Central Bank of Ireland. Our portfolio managers are qualified investment professionals with extensive experience in financial markets. We provide independent investment advice based on your personal circumstances. A full service agreement and terms of engagement are provided before commencing management. Past performance is not indicative of future results. Investment returns are not guaranteed and capital can fluctuate.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get Professional Management
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our portfolio managers to discuss your investment needs and goals.
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
