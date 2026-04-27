import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function IndividualHealth() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Individual Health Insurance</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Individual Health Insurance provides comprehensive private medical coverage tailored to your personal healthcare needs. With access to Ireland's leading private hospitals and consultants, you receive prompt treatment and choice of care without NHS waiting lists.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Coverage includes hospital treatment, day-case procedures, outpatient consultations, and diagnostic services. Choose from flexible plans that suit your budget and healthcare requirements.
            </p>
          </div>

          {/* Coverage Details */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Details</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Hospital Treatment</h3>
                <p className="text-gray-700 text-sm">Full coverage for private hospital admission, including accommodation, theatre costs, and nursing care for acute medical conditions and planned procedures.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Consultant Fees</h3>
                <p className="text-gray-700 text-sm">Coverage for specialist consultant fees for diagnosis and treatment. Access to Ireland's leading consultants across all medical specialties.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Diagnostic Services</h3>
                <p className="text-gray-700 text-sm">Covered diagnostic tests including X-rays, CT scans, MRI scans, blood tests, and ultrasounds when medically necessary.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Day-Case Procedures</h3>
                <p className="text-gray-700 text-sm">Full coverage for procedures performed on a day-case basis in accredited hospitals and clinics.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Mental Health Services</h3>
                <p className="text-gray-700 text-sm">Coverage for mental health treatment including psychiatric consultations and psychological therapy sessions.</p>
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
                <li>• Fertility treatments and IVF</li>
                <li>• Dental and optical care (available as optional add-ons)</li>
                <li>• Chronic conditions with pre-existing symptoms (subject to waiting periods)</li>
                <li>• Treatment outside Ireland (except emergency cover)</li>
                <li>• Experimental or unproven treatments</li>
                <li>• Self-inflicted injuries or treatment related to alcohol/drug abuse</li>
              </ul>
            </div>
          </div>

          {/* Premium Information */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Premium Information</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pricing Factors</h3>
                <p className="text-gray-700 text-sm">
                  Premiums are based on your age, health status, and chosen coverage level. We offer competitive rates with discounts for early payment and no-claims bonuses.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Payment Options</h3>
                <p className="text-gray-700 text-sm">
                  Pay monthly, quarterly, or annually. Monthly payments offer convenience, while annual payment provides savings of up to 5%.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">No Claims Bonus</h3>
                <p className="text-gray-700 text-sm">
                  Earn discounts on future premiums for each year you don't make a claim. Bonus can accumulate up to 20% discount.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Waiting Periods</h3>
                <p className="text-gray-700 text-sm">
                  Standard waiting periods apply: 30 days for general cover, 12 months for pre-existing conditions (subject to declaration).
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Individuals seeking private healthcare access without waiting lists</li>
              <li>• Those wanting choice of hospital and consultant</li>
              <li>• Self-employed professionals requiring comprehensive health cover</li>
              <li>• Anyone prioritizing prompt diagnosis and treatment</li>
              <li>• Those with specific healthcare needs requiring specialist care</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All health insurance plans comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Our plans are underwritten by authorized insurance providers.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right health insurance plan for your needs.
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
