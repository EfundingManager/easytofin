import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BusinessInsurance() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container">
          <Link href="/general-insurance" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Business Insurance</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Business Insurance provides comprehensive protection for your company against property damage, liability claims, and business interruption. Tailored coverage protects your assets, employees, and business continuity.
            </p>
            <p className="text-gray-700 leading-relaxed">
              From small businesses to larger enterprises, we offer flexible policies that cover buildings, contents, equipment, and liability. Protect your business with coverage designed for your specific industry and needs.
            </p>
          </div>

          {/* Coverage Details */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Details</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Buildings Coverage</h3>
                <p className="text-gray-700 text-sm">Protection for your business premises including structure, fixtures, and permanent installations against fire, theft, and weather damage.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Contents Coverage</h3>
                <p className="text-gray-700 text-sm">Full coverage for business equipment, stock, furniture, and other contents against theft, damage, and loss.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Public Liability</h3>
                <p className="text-gray-700 text-sm">Protection against legal liability for injury to members of the public or damage to their property caused by your business.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Employers' Liability</h3>
                <p className="text-gray-700 text-sm">Statutory coverage for injury to employees and legal liability arising from employment. Mandatory for businesses with employees.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Business Interruption</h3>
                <p className="text-gray-700 text-sm">Coverage for loss of income if your business is forced to close due to insured damage, ensuring financial stability during recovery.</p>
              </div>
            </div>
          </div>

          {/* Exclusions */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Exclusions</h2>
            <div className="bg-red-50 p-6 rounded-lg space-y-3">
              <p className="text-gray-700 text-sm">
                Please note that the following are typically not covered:
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Wear and tear or gradual deterioration</li>
                <li>• Damage from lack of maintenance</li>
                <li>• Losses from fraud or dishonesty by employees</li>
                <li>• Cyber attacks or data breaches (unless cyber cover added)</li>
                <li>• Losses from business decisions or market changes</li>
                <li>• Damage from war or civil unrest</li>
                <li>• Losses from pollution or environmental damage</li>
                <li>• Losses from regulatory fines or penalties</li>
              </ul>
            </div>
          </div>

          {/* Premium Information */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Premium Information</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customized Quotes</h3>
                <p className="text-gray-700 text-sm">
                  Premiums are tailored based on business type, size, location, turnover, number of employees, and claims history.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Coverage Options</h3>
                <p className="text-gray-700 text-sm">
                  Choose coverage levels that match your business needs. Optional add-ons available for cyber, professional indemnity, and other specialized risks.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Options</h3>
                <p className="text-gray-700 text-sm">
                  Pay monthly, quarterly, or annually. Annual payment provides savings of up to 5% compared to monthly payments.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">No Claims Discount</h3>
                <p className="text-gray-700 text-sm">
                  Earn discounts for each year without claims. Discount can accumulate up to 25% on renewal.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• All businesses with physical premises or equipment</li>
              <li>• Companies with employees (employers' liability is mandatory)</li>
              <li>• Businesses seeking comprehensive protection</li>
              <li>• Companies wanting business interruption coverage</li>
              <li>• Those looking to protect business assets and continuity</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All business insurance policies comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Our policies are underwritten by authorized insurance providers. Employers' liability is mandatory for businesses with employees.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right business insurance coverage for your company.
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
