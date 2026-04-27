import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CorporateHealth() {
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
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Corporate Health Insurance</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Corporate Health Insurance provides comprehensive employee health benefits designed to attract and retain top talent. Offer your workforce access to Ireland's leading private hospitals and consultants as part of your employee benefits package.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Group schemes offer significant cost savings compared to individual policies, with flexible coverage options tailored to your company's needs and budget. Enhance employee satisfaction and wellbeing with quality healthcare access.
            </p>
          </div>

          {/* Coverage Details */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Coverage Details</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Employee Coverage</h3>
                <p className="text-gray-700 text-sm">Comprehensive health insurance for all eligible employees with flexible eligibility criteria and waiting periods.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Dependent Coverage</h3>
                <p className="text-gray-700 text-sm">Optional coverage for employee spouses and children at discounted group rates.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Hospital Treatment</h3>
                <p className="text-gray-700 text-sm">Full coverage for private hospital admission including accommodation, theatre costs, and nursing care for acute conditions and planned procedures.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Occupational Health Services</h3>
                <p className="text-gray-700 text-sm">Access to occupational health assessments, workplace health screening, and wellness programs.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Mental Health & Wellbeing</h3>
                <p className="text-gray-700 text-sm">Coverage for mental health services, counseling, and employee assistance programs to support employee wellbeing.</p>
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
                <li>• Work-related injuries (covered by employers' liability)</li>
                <li>• Treatment related to alcohol or drug abuse</li>
              </ul>
            </div>
          </div>

          {/* Premium Information */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Premium Information</h2>
            <div className="bg-teal-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Group Discounts</h3>
                <p className="text-gray-700 text-sm">
                  Significant cost savings through group purchasing power. Discounts increase with company size and number of employees covered.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Contribution Models</h3>
                <p className="text-gray-700 text-sm">
                  Choose from fully employer-funded, shared contribution, or employee-funded models. Contributions are tax-deductible for the employer.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customizable Coverage Levels</h3>
                <p className="text-gray-700 text-sm">
                  Tailor coverage to your company's needs and budget. Options range from essential cover to comprehensive plans with enhanced benefits.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Annual Review & Renewal</h3>
                <p className="text-gray-700 text-sm">
                  Annual review of claims experience and renewal options. Potential discounts based on claims history and employee wellness programs.
                </p>
              </div>
            </div>
          </div>

          {/* Who Should Consider It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Should Consider It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Small to medium-sized businesses seeking employee benefits</li>
              <li>• Companies wanting to attract and retain top talent</li>
              <li>• Organizations prioritizing employee health and wellbeing</li>
              <li>• Businesses looking for cost-effective group health solutions</li>
              <li>• Companies with 5+ employees eligible for group schemes</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All corporate health insurance plans comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request. Our plans are underwritten by authorized insurance providers. Employer contributions may have tax implications - please consult your accountant.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to design the right corporate health insurance plan for your company.
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
