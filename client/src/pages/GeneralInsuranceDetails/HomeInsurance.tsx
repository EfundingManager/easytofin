import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomeInsurance() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Home Insurance</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our comprehensive Home Insurance protects your property and possessions against damage, theft, and liability. Whether you own your home or rent, we offer flexible coverage options tailored to your needs and budget.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Choose between buildings insurance (for homeowners), contents insurance (for your belongings), or a combined policy. Our competitive rates and excellent claims service ensure your home is protected.
            </p>
          </div>

          {/* Coverage Details */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Details</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Buildings Coverage</h3>
                <p className="text-gray-700 text-sm">Protection for the structure of your home including walls, roof, fitted kitchens, bathrooms, and permanent fixtures against fire, theft, vandalism, and weather damage.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Contents Coverage</h3>
                <p className="text-gray-700 text-sm">Full coverage for your personal belongings including furniture, electronics, clothing, and other items against theft, damage, and accidental loss.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Personal Possessions</h3>
                <p className="text-gray-700 text-sm">Coverage for items taken outside the home such as jewelry, mobile phones, and cameras with optional worldwide coverage.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Liability Protection</h3>
                <p className="text-gray-700 text-sm">Legal liability coverage if someone is injured in your home or you accidentally damage someone else's property.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Emergency Repairs</h3>
                <p className="text-gray-700 text-sm">Coverage for emergency repairs to prevent further damage, such as broken windows, damaged locks, or roof leaks.</p>
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
                <li>• Subsidence or ground heave (unless optional cover added)</li>
                <li>• Flooding from rivers or drains (unless optional cover added)</li>
                <li>• Items left unattended in vehicles</li>
                <li>• Theft when home left unoccupied for extended periods</li>
                <li>• High-value items without specified coverage</li>
                <li>• Damage from pets or animals</li>
              </ul>
            </div>
          </div>

          {/* Premium Information */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Premium Information</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
                <p className="text-gray-700 text-sm">
                  Our premiums are based on property location, age, construction, security features, and claims history. We offer competitive rates with no hidden charges.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Excess Options</h3>
                <p className="text-gray-700 text-sm">
                  Choose your excess level to suit your budget. Higher excess reduces premiums; lower excess provides more protection.
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
                  Earn discounts for each year without claims. Discount can accumulate up to 30% on renewal.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Homeowners seeking comprehensive property protection</li>
              <li>• Renters wanting to protect their belongings</li>
              <li>• Those with valuable items requiring specified coverage</li>
              <li>• Anyone wanting liability protection for accidents at home</li>
              <li>• Landlords protecting their rental properties</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All home insurance policies comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Our policies are underwritten by authorized insurance providers.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right home insurance coverage for your needs.
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
