import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LiabilityInsurance() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Liability Insurance</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Liability Insurance protects you against legal claims and compensation costs if you accidentally injure someone or damage their property. This essential coverage is crucial for businesses and individuals who want financial protection from unexpected liability claims.
            </p>
            <p className="text-gray-700 leading-relaxed">
              From public liability to professional indemnity, we offer comprehensive coverage tailored to your specific needs. Protect your assets and reputation with our expert liability solutions.
            </p>
          </div>

          {/* Coverage Details */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Details</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Public Liability</h3>
                <p className="text-gray-700 text-sm">Coverage for legal liability if members of the public are injured or their property is damaged due to your actions or negligence.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Employers' Liability</h3>
                <p className="text-gray-700 text-sm">Statutory coverage for injury to employees and legal liability arising from employment. Mandatory for businesses with employees.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Professional Indemnity</h3>
                <p className="text-gray-700 text-sm">Protection against claims of negligence or errors in professional services you provide, covering legal costs and compensation.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Product Liability</h3>
                <p className="text-gray-700 text-sm">Coverage for injury or damage caused by products you manufacture or sell, including legal defense costs.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Legal Defense Costs</h3>
                <p className="text-gray-700 text-sm">Coverage for legal fees, court costs, and expert witness fees in defending liability claims, often covered in addition to the liability limit.</p>
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
                <li>• Intentional or deliberate acts</li>
                <li>• Losses from contractual liability (unless specifically covered)</li>
                <li>• Fines or penalties imposed by regulatory authorities</li>
                <li>• Losses from pollution or environmental damage</li>
                <li>• Claims arising from war or civil unrest</li>
                <li>• Losses from fraud or dishonesty</li>
                <li>• Liability assumed under contract (unless endorsed)</li>
                <li>• Claims from defective design or manufacturing defects known before sale</li>
              </ul>
            </div>
          </div>

          {/* Premium Information */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Premium Information</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customized Coverage Limits</h3>
                <p className="text-gray-700 text-sm">
                  Choose liability limits that match your risk exposure. Standard limits range from €1 million to €10 million or higher depending on your needs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Industry-Specific Rates</h3>
                <p className="text-gray-700 text-sm">
                  Premiums are tailored to your industry, business size, claims history, and risk profile. Different industries face different liability risks.
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
                  Earn discounts for each year without claims. Discount can accumulate up to 20% on renewal for claims-free records.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• All businesses seeking protection from liability claims</li>
              <li>• Companies with employees (employers' liability is mandatory)</li>
              <li>• Professional service providers (consultants, accountants, lawyers)</li>
              <li>• Product manufacturers and retailers</li>
              <li>• Event organizers and venues</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All liability insurance policies comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Our policies are underwritten by authorized insurance providers. Employers' liability is mandatory for businesses with employees in Ireland.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right liability insurance coverage for your needs.
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
