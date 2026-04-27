import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandlordInsurance() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Landlord Insurance</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Landlord Insurance is specifically designed to protect your rental property investment. Unlike standard home insurance, landlord policies cover the unique risks associated with renting out residential or commercial properties.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Protect your rental income, property structure, and contents with comprehensive coverage including liability protection and optional loss of rent coverage for when your property is unoccupied.
            </p>
          </div>

          {/* Coverage Details */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Details</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Buildings Coverage</h3>
                <p className="text-gray-700 text-sm">Protection for the structure of your rental property including walls, roof, fitted kitchens, bathrooms, and permanent fixtures against fire, theft, vandalism, and weather damage.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Contents Coverage</h3>
                <p className="text-gray-700 text-sm">Coverage for furnished items provided by you as the landlord, including furniture, appliances, and decorative items.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Landlord Liability</h3>
                <p className="text-gray-700 text-sm">Legal liability protection if a tenant or visitor is injured in the property or if you accidentally damage their property.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Loss of Rent</h3>
                <p className="text-gray-700 text-sm">Coverage for lost rental income if your property becomes uninhabitable due to insured damage, protecting your investment income.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Accidental Damage</h3>
                <p className="text-gray-700 text-sm">Optional coverage for accidental damage caused by tenants or visitors, including breakage of fixtures and fittings.</p>
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
                <li>• Damage from lack of maintenance or repairs</li>
                <li>• Loss of rent if property is left unoccupied without notice</li>
                <li>• Damage caused by tenants' negligence (unless accidental damage cover added)</li>
                <li>• Subsidence or ground heave (unless optional cover added)</li>
                <li>• Flooding from rivers or drains (unless optional cover added)</li>
                <li>• Loss of rent from tenant disputes or eviction proceedings</li>
                <li>• Damage from illegal use of property</li>
              </ul>
            </div>
          </div>

          {/* Premium Information */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Premium Information</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Competitive Rates</h3>
                <p className="text-gray-700 text-sm">
                  Premiums are based on property location, type, age, rental income, number of tenants, and claims history. We offer competitive rates for landlords.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Coverage Options</h3>
                <p className="text-gray-700 text-sm">
                  Choose coverage levels for buildings, contents, and optional loss of rent. Customize your policy to match your investment needs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Options</h3>
                <p className="text-gray-700 text-sm">
                  Pay monthly, quarterly, or annually. Annual payment provides savings of up to 5% compared to monthly payments.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Multi-Property Discounts</h3>
                <p className="text-gray-700 text-sm">
                  Insure multiple rental properties with us and receive discounts on your premiums. The more properties, the greater the savings.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Landlords renting out residential properties</li>
              <li>• Owners of buy-to-let investment properties</li>
              <li>• Those wanting loss of rent protection</li>
              <li>• Landlords seeking comprehensive liability coverage</li>
              <li>• Property investors with multiple rental units</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All landlord insurance policies comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Our policies are underwritten by authorized insurance providers. Landlord policies differ from standard home insurance and are designed specifically for rental properties.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right landlord insurance coverage for your rental property.
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
