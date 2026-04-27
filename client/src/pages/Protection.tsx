import { Link } from "wouter";
import { Shield, Heart, Briefcase, AlertCircle, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const PROTECTION_PRODUCTS = [
  {
    id: "life-assurance",
    icon: Shield,
    title: "Life Assurance",
    description: "Comprehensive life insurance coverage to protect your family's financial future",
    href: "/protection/life-assurance",
    color: "from-blue-500 to-blue-600",
    features: ["Family protection", "Mortgage cover", "Income replacement"],
  },
  {
    id: "serious-illness",
    icon: Heart,
    title: "Specified Serious Illness Cover",
    description: "Protection against critical illnesses with lump sum payouts",
    href: "/protection/serious-illness",
    color: "from-red-500 to-red-600",
    features: ["Critical illness protection", "Lump sum payment", "Peace of mind"],
  },
  {
    id: "income-protection",
    icon: Briefcase,
    title: "Income Protection",
    description: "Replace your income if you're unable to work due to illness or injury",
    href: "/protection/income-protection",
    color: "from-green-500 to-green-600",
    features: ["Income replacement", "Long-term security", "Flexible terms"],
  },
  {
    id: "accident-sickness",
    icon: AlertCircle,
    title: "Accident & Sickness Cover",
    description: "Short-term protection for accidents and sickness-related absences",
    href: "/protection/accident-sickness",
    color: "from-yellow-500 to-yellow-600",
    features: ["Accident coverage", "Sickness protection", "Quick payouts"],
  },
  {
    id: "personal-accident",
    icon: Users,
    title: "Personal Accident Plan",
    description: "Comprehensive accident coverage for you and your family",
    href: "/protection/personal-accident",
    color: "from-purple-500 to-purple-600",
    features: ["Personal protection", "Family coverage", "Accident benefits"],
  },
];

export default function Protection() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="container">
          <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-blue-900 mb-4">
            Protection Products
          </h1>
          <p className="text-lg text-blue-800 max-w-2xl">
            Comprehensive protection solutions to safeguard your family's financial future. Choose from our range of life insurance and protection products tailored to your needs.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROTECTION_PRODUCTS.map((product) => {
              const IconComponent = product.icon;
              return (
                <Link key={product.id} href={product.href}>
                  <div className="group h-full bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer">
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${product.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent size={32} />
                    </div>

                    {/* Title */}
                    <h3 className="font-[Outfit] font-700 text-xl text-gray-900 mb-2">
                      {product.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {product.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                      Learn More <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container text-center">
          <h2 className="font-[Outfit] font-800 text-3xl text-white mb-4">
            Not sure which protection is right for you?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Our expert advisors can help you find the perfect protection solution for your needs.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Get Expert Advice <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
