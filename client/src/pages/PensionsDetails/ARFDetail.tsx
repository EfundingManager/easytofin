import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ARFDetail() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Approved Retirement Fund (ARF)</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              An Approved Retirement Fund (ARF) is a tax-efficient investment account that allows you to invest your remaining pension after taking your tax-free lump sum. ARFs provide flexibility in how you access your retirement income and continue to benefit from tax-free investment growth.
            </p>
            <p className="text-gray-700 leading-relaxed">
              ARFs are ideal for those who want to maintain investment control in retirement, access income flexibly, and potentially leave remaining funds to their heirs.
            </p>
          </div>

          {/* Key Aspects */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Aspects</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Investment Control</h3>
                <p className="text-gray-700 text-sm">You maintain full control over your investments, choosing from a range of funds based on your risk tolerance and retirement needs.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Flexible Income Access</h3>
                <p className="text-gray-700 text-sm">Withdraw income as needed, subject to minimum withdrawal requirements from age 61. No mandatory annuity purchase required.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Inheritance Benefits</h3>
                <p className="text-gray-700 text-sm">Any remaining ARF balance can be left to your heirs, subject to tax implications. This provides flexibility for estate planning.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Drawdown Mortgage (DMF)</h3>
                <p className="text-gray-700 text-sm">You can establish a Drawdown Mortgage Fund (DMF) to provide a guaranteed income stream while maintaining investment flexibility.</p>
              </div>
            </div>
          </div>

          {/* Tax Benefits */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Tax Benefits</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Investment Growth</h3>
                <p className="text-gray-700 text-sm">
                  All investment returns within your ARF are tax-free. No tax is paid on dividends, interest, or capital gains while your money is invested.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Withdrawal Taxation</h3>
                <p className="text-gray-700 text-sm">
                  Withdrawals from your ARF are taxed as income at your marginal rate. You can manage your tax position by timing withdrawals strategically.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Minimum Withdrawal Requirements</h3>
                <p className="text-gray-700 text-sm">
                  From age 61, you must withdraw a minimum percentage of your ARF annually (4% from age 61-70, 5% from age 71-80, 6% from age 81+). This ensures gradual income drawdown.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Inheritance Tax Efficiency</h3>
                <p className="text-gray-700 text-sm">
                  Remaining ARF balances can be passed to heirs, subject to income tax on the beneficiary. This provides flexibility for estate planning compared to annuities.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Retirees wanting investment control in retirement</li>
              <li>• Those seeking flexible income access</li>
              <li>• High-net-worth individuals with substantial pensions</li>
              <li>• Those wanting to leave remaining funds to heirs</li>
              <li>• Individuals preferring not to purchase an annuity</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              ARFs are regulated by the Pensions Authority of Ireland and comply with all Irish pension regulations. Minimum withdrawal requirements are mandatory from age 61. ARFs must be established through a regulated provider. We provide full ARF administration, investment management, and income planning services.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors about establishing an ARF and managing your retirement income.
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
