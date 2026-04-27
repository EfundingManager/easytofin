import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StocksShares() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Stocks & Shares</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Stocks & Shares service provides access to global equity markets with professional trading execution and investment research. Whether you're a seasoned investor or building your first portfolio, we offer the tools, guidance, and support to invest in individual stocks and shares.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Access thousands of stocks across major exchanges worldwide. Benefit from research, analysis, and expert recommendations to make informed investment decisions.
            </p>
          </div>

          {/* Trading Features */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Trading Features</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Global Market Access</h3>
                <p className="text-gray-700 text-sm">Trade stocks on major exchanges including Dublin, London, New York, and other international markets. Access blue-chip companies and growth stocks worldwide.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Real-Time Pricing</h3>
                <p className="text-gray-700 text-sm">Access real-time market data and pricing information. Make informed decisions with up-to-date market information and technical analysis tools.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Research & Analysis</h3>
                <p className="text-gray-700 text-sm">Receive detailed company research, analyst recommendations, and market insights. Our research team provides regular updates on market trends and opportunities.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Dividend Management</h3>
                <p className="text-gray-700 text-sm">Automatic dividend reinvestment options available. Track dividend income and manage your dividend portfolio for income generation.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Tax Reporting</h3>
                <p className="text-gray-700 text-sm">Comprehensive tax reporting and documentation. Capital gains and dividend information provided for tax filing purposes.</p>
              </div>
            </div>
          </div>

          {/* Investment Strategies */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Investment Strategies</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Growth Investing</h3>
                <p className="text-gray-700 text-sm">
                  Focus on companies with strong growth potential and increasing earnings. Suitable for investors seeking capital appreciation over time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Value Investing</h3>
                <p className="text-gray-700 text-sm">
                  Identify undervalued stocks trading below intrinsic value. Focus on established companies with strong fundamentals and dividend yields.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dividend Income</h3>
                <p className="text-gray-700 text-sm">
                  Build a portfolio of dividend-paying stocks for regular income. Focus on companies with consistent dividend histories and growth.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Sector Rotation</h3>
                <p className="text-gray-700 text-sm">
                  Rotate investments across sectors based on economic cycles and market conditions. Capitalize on sector outperformance opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Risk Management</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Diversification</h3>
                <p className="text-gray-700 text-sm">Spread investments across multiple stocks and sectors to reduce concentration risk. Balance portfolio across different industries and market caps.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Stop-Loss Orders</h3>
                <p className="text-gray-700 text-sm">Set automatic sell orders to limit losses on individual positions. Protect capital by exiting positions when they decline below predetermined levels.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Position Sizing</h3>
                <p className="text-gray-700 text-sm">Allocate appropriate amounts to each position based on risk tolerance. Avoid overconcentration in any single stock or sector.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Regular Review</h3>
                <p className="text-gray-700 text-sm">Quarterly portfolio reviews to assess performance and rebalance as needed. Monitor holdings for changes in fundamentals or market conditions.</p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Experienced investors seeking direct stock market access</li>
              <li>• Those building long-term equity portfolios</li>
              <li>• Investors seeking dividend income from stocks</li>
              <li>• People wanting to implement specific investment strategies</li>
              <li>• Anyone seeking growth through equity market participation</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This service is regulated by the Central Bank of Ireland. All stock trading is executed through authorized brokers and exchanges. We provide research and recommendations, but investment decisions are yours. Past performance is not indicative of future results. Stock prices fluctuate and capital can be lost. Diversification does not guarantee profit or protect against loss. Tax treatment of dividends and capital gains depends on individual circumstances.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Start Trading
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our investment advisors to open an account and begin trading stocks and shares.
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
