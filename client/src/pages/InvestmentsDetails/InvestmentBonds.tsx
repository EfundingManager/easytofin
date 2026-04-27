import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function InvestmentBonds() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Investment Bonds</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Investment Bonds are tax-efficient investment vehicles that allow you to invest a lump sum in a diversified portfolio of funds. Ideal for individuals with capital to invest who want flexibility, professional management, and tax advantages.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Investment bonds offer a single investment wrapper with access to multiple funds, tax-deferred growth, and the flexibility to withdraw, transfer, or adjust your investments as needed.
            </p>
          </div>

          {/* Bond Features */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Bond Features</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Lump Sum Investment</h3>
                <p className="text-gray-700 text-sm">Invest a single amount from €5,000 upwards. Your capital is invested across your chosen fund portfolio immediately.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Multiple Fund Access</h3>
                <p className="text-gray-700 text-sm">Access to hundreds of investment funds across different asset classes, sectors, and geographies within a single bond.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Tax-Deferred Growth</h3>
                <p className="text-gray-700 text-sm">No tax on investment growth while held within the bond. Tax only due on encashment or full maturity, providing tax-efficient growth.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Flexible Access</h3>
                <p className="text-gray-700 text-sm">Withdraw funds at any time without penalty. Partial withdrawals available, allowing you to access capital as needed.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Rebalancing Options</h3>
                <p className="text-gray-700 text-sm">Switch between funds within the bond without tax consequences. Rebalance your portfolio to maintain your desired asset allocation.</p>
              </div>
            </div>
          </div>

          {/* Tax Benefits */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Tax Benefits</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Deferred Growth</h3>
                <p className="text-gray-700 text-sm">
                  Investment growth within the bond is not subject to income tax or capital gains tax annually. Tax is only due when you encash or the bond matures.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Gross Fund Access</h3>
                <p className="text-gray-700 text-sm">
                  Invest in funds on a gross basis without withholding tax on dividends. This allows for compounding of dividend income without annual tax drag.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Encashment Flexibility</h3>
                <p className="text-gray-700 text-sm">
                  Manage your tax liability by choosing when to encash. Spread withdrawals across multiple tax years to optimize your tax position.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Estate Planning</h3>
                <p className="text-gray-700 text-sm">
                  Bonds can be written in trust for estate planning purposes, providing flexibility for succession planning and inheritance tax management.
                </p>
              </div>
            </div>
          </div>

          {/* Investment Options */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Investment Options</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Equity Funds</h3>
                <p className="text-gray-700 text-sm">Stock market focused funds offering growth potential. Includes domestic, international, and emerging market options.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Fixed Income Funds</h3>
                <p className="text-gray-700 text-sm">Bond and fixed-income securities providing stable income. Lower volatility with predictable cash flows.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Balanced Funds</h3>
                <p className="text-gray-700 text-sm">Mixed portfolios combining stocks and bonds. Provides diversification and moderate risk-return profiles.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Alternative Investments</h3>
                <p className="text-gray-700 text-sm">Commodities, property, and hedge funds for portfolio diversification beyond traditional stocks and bonds.</p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Individuals with lump sums to invest (€5,000+)</li>
              <li>• Those seeking tax-efficient investment vehicles</li>
              <li>• People wanting professional fund management</li>
              <li>• Investors requiring flexibility and access to capital</li>
              <li>• Those planning for retirement or long-term wealth accumulation</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All investment bonds comply with Irish investment regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Past performance is not indicative of future results. Investment returns are not guaranteed and capital can fluctuate. Tax treatment depends on individual circumstances.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Invest in a Bond
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our investment advisors to find the right investment bond strategy for your needs.
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
