import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PROTECTION_PRODUCTS = [
  {
    id: "life-assurance",
    title: "Life Assurance",
    description: "A lump sum paid to your family in the event of your death, ensuring they can maintain their standard of living and meet financial obligations such as bills and other commitments.",
    href: "/protection/life-assurance",
  },
  {
    id: "serious-illness",
    title: "Specified Serious Illness Cover",
    description: "A tax-free lump sum paid on diagnosis of a specified serious illness such as cancer, heart attack or stroke. Gives you financial breathing room to focus on recovery.",
    href: "/protection/serious-illness",
  },
  {
    id: "income-protection",
    title: "Income Protection",
    description: "Replaces a portion of your income if you are unable to work due to illness or injury. Provides long-term financial security when you need it most.",
    href: "/protection/income-protection",
  },
  {
    id: "accident-sickness",
    title: "Accident & Sickness Cover",
    description: "Short-term income replacement cover that pays a weekly benefit if you are unable to work due to an accident or sickness. Ideal for self-employed individuals.",
    href: "/protection/accident-sickness",
  },
  {
    id: "personal-accident",
    title: "Personal Accident Plan",
    description: "Provides cash benefits and lump sum payments in the event of accidental injury, fractures or hospitalisation. Complements your existing health insurance.",
    href: "/protection/personal-accident",
  },
];

export default function Protection() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 bg-white border-b">
        <div className="container">
          <h1 className="font-[Outfit] font-700 text-4xl text-gray-900 mb-2">
            What We Offer
          </h1>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROTECTION_PRODUCTS.map((product) => (
              <div key={product.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-teal-600 transition-colors">
                {/* Title with underline */}
                <h3 className="font-[Outfit] font-600 text-lg text-gray-900 mb-3 pb-3 border-b-4 border-teal-600 inline-block">
                  {product.title}
                </h3>

                {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Learn More Link */}
                <Link href={product.href} className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm hover:gap-3 transition-all">
                  Learn more <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
