import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MotorInsurance() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Motor Insurance</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Motor Insurance provides comprehensive coverage for your vehicle against accidents, theft, and damage. Whether you need third-party cover (legally required) or comprehensive protection, we offer flexible policies at competitive rates.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Benefit from 24/7 roadside assistance, quick claims processing, and access to our network of approved repair centers. Drive with confidence knowing you're protected.
            </p>
          </div>

          {/* Coverage Details */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Details</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Third-Party Liability</h3>
                <p className="text-gray-700 text-sm">Legal minimum coverage for damage to third-party vehicles and property, and injuries to third parties. Mandatory in Ireland.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Fire & Theft</h3>
                <p className="text-gray-700 text-sm">Third-party cover plus protection against fire damage and theft of your vehicle.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Comprehensive Coverage</h3>
                <p className="text-gray-700 text-sm">Full protection including collision damage, theft, fire, vandalism, and accidental damage to your vehicle.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Breakdown Assistance</h3>
                <p className="text-gray-700 text-sm">24/7 roadside assistance including recovery, towing, and onward travel if your vehicle breaks down.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Windscreen Cover</h3>
                <p className="text-gray-700 text-sm">Coverage for windscreen and window glass damage with no excess on glass claims.</p>
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
                <li>• Damage from normal wear and tear</li>
                <li>• Mechanical or electrical breakdown</li>
                <li>• Driving under the influence of alcohol or drugs</li>
                <li>• Driving with an invalid or expired license</li>
                <li>• Damage while racing or in competitions</li>
                <li>• Damage from use of vehicle for hire or reward (unless covered)</li>
                <li>• Damage from driving in dangerous conditions without care</li>
                <li>• Losses from business use (unless business policy)</li>
              </ul>
            </div>
          </div>

          {/* Premium Information */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Premium Information</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Factors Affecting Premium</h3>
                <p className="text-gray-700 text-sm">
                  Premiums depend on vehicle type, age, engine size, driver age and experience, driving record, annual mileage, and claims history.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Excess Options</h3>
                <p className="text-gray-700 text-sm">
                  Choose your excess level to suit your budget. Voluntary excess can further reduce your premium.
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
                  Earn discounts for each year without claims. Discount can accumulate up to 50% on renewal for experienced drivers.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• All vehicle owners (third-party cover is legally required)</li>
              <li>• Those wanting comprehensive protection for their vehicle</li>
              <li>• Drivers seeking 24/7 breakdown assistance</li>
              <li>• New drivers wanting affordable insurance options</li>
              <li>• Anyone with valuable or financed vehicles</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All motor insurance policies comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Our policies are underwritten by authorized insurance providers. Third-party cover is mandatory in Ireland.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right motor insurance coverage for your vehicle.
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
