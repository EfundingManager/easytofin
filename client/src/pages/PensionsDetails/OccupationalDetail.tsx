import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OccupationalDetail() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Occupational Pension Schemes</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Occupational pension schemes are employer-sponsored retirement plans that allow both employers and employees to contribute towards retirement savings. These schemes provide a structured approach to retirement planning and are often a valuable employee benefit.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We advise both employers on scheme design, compliance, and administration, and employees on maximizing their benefits and understanding their pension entitlements.
            </p>
          </div>

          {/* Key Aspects */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Aspects</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Employer Contributions</h3>
                <p className="text-gray-700 text-sm">Employers contribute to the scheme, which is a valuable employee benefit. Employer contributions are tax-deductible and not treated as taxable income for employees.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Employee Contributions</h3>
                <p className="text-gray-700 text-sm">Employees make regular contributions from their salary, which receive full tax relief. Contributions are deducted before tax is calculated.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Defined Benefit or Defined Contribution</h3>
                <p className="text-gray-700 text-sm">Schemes can be structured as defined benefit (guaranteed income) or defined contribution (investment-based). Most modern schemes are defined contribution.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Professional Management</h3>
                <p className="text-gray-700 text-sm">Schemes are professionally managed with trustee oversight, ensuring compliance with regulations and protection of member interests.</p>
              </div>
            </div>
          </div>

          {/* Tax Benefits */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Tax Benefits</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax Relief on Employee Contributions</h3>
                <p className="text-gray-700 text-sm">
                  Employee contributions receive tax relief at the marginal rate (up to 40%). This means contributions are made from pre-tax income, reducing your taxable income.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Deductible Employer Contributions</h3>
                <p className="text-gray-700 text-sm">
                  Employer contributions are fully tax-deductible for the business, reducing corporation tax liability. These contributions are not treated as taxable income for employees.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Investment Growth</h3>
                <p className="text-gray-700 text-sm">
                  All investment growth within the scheme is tax-free. No tax is paid on dividends, interest, or capital gains.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tax-Free Lump Sum at Retirement</h3>
                <p className="text-gray-700 text-sm">
                  Members can take up to 25% of their pension fund as a tax-free lump sum at retirement, with the remainder used for income or transferred to an ARF.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Employers wanting to offer competitive employee benefits</li>
              <li>• Employees seeking structured retirement planning</li>
              <li>• Businesses looking to attract and retain talent</li>
              <li>• Employers seeking tax-efficient benefit structures</li>
              <li>• Employees wanting employer-matched contributions</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              Occupational pension schemes are regulated by the Pensions Authority of Ireland and must comply with the Pensions Act 1990 and subsequent regulations. All schemes must have a trust deed and rules, and trustees must act in the best interests of members. We provide full compliance support and member communication services.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors about establishing or optimizing your occupational pension scheme.
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
