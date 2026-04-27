import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PersonalAccident() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container">
          <Link href="/services/protection" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="font-[Outfit] font-700 text-3xl text-gray-900 mb-8">Personal Accident Plan</h1>

          {/* Overview */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Personal Accident Plan provides cash benefits and lump sum payments in the event of accidental injury, fractures, or hospitalisation. It complements your existing health insurance by offering financial support during recovery.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This cover is ideal for active individuals and families who want additional financial protection against the unexpected costs of accidents.
            </p>
          </div>

          {/* Coverage Types */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">What's Covered</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Accidental Injury</h3>
                <p className="text-gray-700 text-sm">Cash payments for injuries sustained from accidents, including fractures, dislocations, and lacerations.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Hospitalisation</h3>
                <p className="text-gray-700 text-sm">Daily allowance for hospital stays resulting from accidental injury, helping cover additional costs.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Permanent Disability</h3>
                <p className="text-gray-700 text-sm">Lump sum payment if an accident results in permanent disability or loss of limb.</p>
              </div>
              <div className="border-l-4 border-teal-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Death Benefit</h3>
                <p className="text-gray-700 text-sm">Lump sum paid to beneficiaries if death results from an accidental injury.</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Cash benefits for accidental injuries</li>
              <li>• Daily hospitalisation allowance</li>
              <li>• Lump sum for permanent disability</li>
              <li>• Death benefit for beneficiaries</li>
              <li>• Complements existing health insurance</li>
              <li>• Affordable premiums for comprehensive cover</li>
            </ul>
          </div>

          {/* Who Needs It */}
          <div className="mb-10">
            <h2 className="font-[Outfit] font-600 text-xl text-gray-900 mb-4">Who Needs It</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Active individuals and sports enthusiasts</li>
              <li>• Families wanting additional accident protection</li>
              <li>• Manual workers at higher risk of accidents</li>
              <li>• Anyone wanting to complement health insurance</li>
              <li>• Those seeking financial protection against unexpected costs</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div className="mb-10 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-[Outfit] font-600 text-sm text-gray-900 mb-2">Important Information</h2>
            <p className="text-gray-700 text-xs">
              This product is regulated by the Central Bank of Ireland. All policies comply with Irish insurance regulations and consumer protection requirements. A full product information document (IPID) is available upon request.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-2">
              Get a Quote
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Speak with our expert advisors to find the right coverage for your needs.
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
