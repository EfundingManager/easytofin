import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FamilyHealth() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container">
          <Link href="/health-insurance" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Family Health Insurance</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Family Health Insurance provides affordable, comprehensive medical coverage for your entire family. Protect your spouse, children, and dependents with a single policy that offers excellent value and peace of mind.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Family plans cover all family members under one policy with streamlined administration and discounted premiums compared to individual policies. Access Ireland's best private hospitals and consultants for your whole family.
            </p>
          </div>

          {/* Coverage Details */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Details</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Comprehensive Family Cover</h3>
                <p className="text-gray-700 text-sm">All family members covered under one policy including parents, children up to age 21 (or 25 if in full-time education), and dependent relatives.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Hospital Treatment</h3>
                <p className="text-gray-700 text-sm">Full coverage for private hospital admission for all family members, including accommodation, theatre costs, and nursing care.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Pediatric Care</h3>
                <p className="text-gray-700 text-sm">Specialized coverage for children including pediatric consultations, vaccinations, and child-specific treatments.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Maternity Cover</h3>
                <p className="text-gray-700 text-sm">Coverage for pregnancy, delivery, and postnatal care at private hospitals with choice of obstetrician.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Diagnostic Services</h3>
                <p className="text-gray-700 text-sm">Full coverage for diagnostic tests for all family members including X-rays, scans, and laboratory tests.</p>
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
                <li>• Cosmetic and aesthetic procedures</li>
                <li>• Fertility treatments and assisted reproduction</li>
                <li>• Dental and optical care (available as optional add-ons)</li>
                <li>• Chronic conditions with pre-existing symptoms (subject to waiting periods)</li>
                <li>• Treatment outside Ireland (except emergency cover)</li>
                <li>• Experimental or unproven treatments</li>
                <li>• Sports injuries from professional sports participation</li>
                <li>• Treatment related to alcohol or drug abuse</li>
              </ul>
            </div>
          </div>

          {/* Premium Information */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Premium Information</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Family Discounts</h3>
                <p className="text-gray-700 text-sm">
                  Family plans offer significant savings compared to individual policies. The more family members covered, the greater the discount per person.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Coverage Levels</h3>
                <p className="text-gray-700 text-sm">
                  Choose from different coverage tiers to suit your budget. Options range from essential cover to comprehensive plans with enhanced benefits.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Options</h3>
                <p className="text-gray-700 text-sm">
                  Pay monthly, quarterly, or annually. Annual payment provides savings of up to 5% compared to monthly payments.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">No Claims Bonus</h3>
                <p className="text-gray-700 text-sm">
                  Earn discounts for each year without claims. Family bonus can accumulate up to 20% discount on renewal.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Families seeking affordable private healthcare for all members</li>
              <li>• Parents wanting prompt access to pediatric care</li>
              <li>• Couples planning to start a family with maternity cover</li>
              <li>• Families wanting choice of hospital and consultant</li>
              <li>• Those seeking value for money with comprehensive family protection</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All family health insurance plans comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Our plans are underwritten by authorized insurance providers.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right family health insurance plan for your needs.
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
