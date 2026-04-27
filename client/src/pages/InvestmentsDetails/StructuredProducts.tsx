import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StructuredProducts() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Structured Products</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Structured Products are sophisticated investment instruments that combine fixed-income securities with derivatives to create customized payoff profiles. These products are designed to provide specific risk-return characteristics tailored to investor objectives, offering potential returns linked to underlying assets while managing downside risk.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Investing through a qualified broker provides access to professionally structured products with clear terms, transparent pricing, and regulatory oversight, making them suitable for investors seeking enhanced returns or specific investment outcomes.
            </p>
          </div>

          {/* Basic Explanation */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">What Are Structured Products?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Structured Products are investment contracts combining a fixed-income component (typically a bond) with derivatives (options) to create customized return profiles. They link returns to underlying assets like stocks, indices, commodities, or currencies, while often providing capital protection or enhanced income features.
            </p>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Key Characteristics</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Customized payoff structures aligned with investor goals</li>
                  <li>• Capital protection features with upside participation potential</li>
                  <li>• Returns linked to underlying asset performance</li>
                  <li>• Fixed maturity dates with predetermined redemption terms</li>
                  <li>• Professional structuring by investment banks and brokers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">How Structured Products Work</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">1. Structure Design</h3>
                <p className="text-gray-700 text-sm">Your broker designs a structured product combining a fixed-income component (providing capital protection) with derivatives (providing upside exposure) based on your investment objectives and risk tolerance.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2. Initial Investment</h3>
                <p className="text-gray-700 text-sm">You invest your capital, which is allocated between the bond component (protecting principal) and the derivative component (providing market exposure). The allocation depends on your chosen structure.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">3. Performance Tracking</h3>
                <p className="text-gray-700 text-sm">The product tracks the performance of underlying assets (stocks, indices, commodities). Returns are calculated based on the specific formula defined in the product terms, which may include caps, floors, or participation rates.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">4. Maturity & Redemption</h3>
                <p className="text-gray-700 text-sm">At maturity, you receive your return based on the product formula. This may include your protected capital plus any earned returns, subject to the product's specific terms and conditions.</p>
              </div>
            </div>
          </div>

          {/* Investment Goals */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Investment Goals Through a Broker</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Capital Protection</h3>
                <p className="text-gray-700 text-sm">Preserve invested capital while gaining exposure to market upside, reducing downside risk through the fixed-income component protecting your principal investment.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Enhanced Returns</h3>
                <p className="text-gray-700 text-sm">Achieve returns exceeding traditional fixed-income investments through leveraged exposure to underlying assets, with potential for significant gains if markets perform well.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Specific Outcome Targeting</h3>
                <p className="text-gray-700 text-sm">Achieve specific investment outcomes through customized structures, such as income generation, capital appreciation, or hedging against market risks.</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Diversification</h3>
                <p className="text-gray-700 text-sm">Gain exposure to diverse underlying assets (stocks, indices, commodities, currencies) through a single investment vehicle, providing portfolio diversification benefits.</p>
              </div>
            </div>
          </div>

          {/* Types of Structured Products */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Common Structured Product Types</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Capital Protected Notes</h3>
                <p className="text-gray-700 text-sm">
                  Guarantee return of principal at maturity while providing upside participation in underlying asset performance. Ideal for conservative investors seeking market exposure with downside protection.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Leveraged Products</h3>
                <p className="text-gray-700 text-sm">
                  Amplify returns through derivative leverage, providing enhanced upside potential. Higher risk than capital-protected products, suitable for experienced investors with higher risk tolerance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Income-Generating Products</h3>
                <p className="text-gray-700 text-sm">
                  Generate regular income through structured coupons or dividends linked to underlying asset performance. Suitable for investors seeking consistent income generation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Barrier Products</h3>
                <p className="text-gray-700 text-sm">
                  Include trigger levels (barriers) that activate specific payoff conditions. Offer enhanced returns when barriers are not breached, with defined outcomes if triggered.
                </p>
              </div>
            </div>
          </div>

          {/* Risk Considerations */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Risk Considerations</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• <strong>Issuer Risk:</strong> Returns depend on the issuing institution's creditworthiness. Issuer default could result in loss of capital.</li>
              <li>• <strong>Complexity Risk:</strong> Structured products can be complex. Full understanding of terms, conditions, and payoff formulas is essential.</li>
              <li>• <strong>Liquidity Risk:</strong> Secondary market liquidity may be limited. Early exit may result in unfavorable pricing.</li>
              <li>• <strong>Market Risk:</strong> Returns are linked to underlying asset performance. Adverse market movements can reduce returns or trigger losses.</li>
              <li>• <strong>Leverage Risk:</strong> Leveraged structures amplify both gains and losses, increasing potential downside exposure.</li>
            </ul>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Sophisticated investors with market knowledge and experience</li>
              <li>• Those seeking specific risk-return profiles not available in traditional investments</li>
              <li>• Investors wanting capital protection with market upside exposure</li>
              <li>• People seeking income generation with customized structures</li>
              <li>• Those with sufficient capital to invest in minimum amounts required</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              Structured Products are regulated by the Central Bank of Ireland and comply with MiFID II regulations. All products must include comprehensive product information documents (IPID) and prospectuses. Broker services are authorized and supervised. Structured products carry issuer credit risk and complexity risk. Past performance is not indicative of future results. Capital is at risk and returns are not guaranteed. Investors should fully understand product terms before investing. Professional investment advice is recommended.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Explore Structured Products
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our investment advisors to discuss structured products tailored to your investment objectives.
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
