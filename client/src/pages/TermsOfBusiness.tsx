import { useLanguage } from "@/contexts/LanguageContext";
import { getObjectTranslation } from "@/lib/i18n";
import { translations } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfBusiness() {
  // Always use English for Terms of Business - no translation required
  const tob = getObjectTranslation('en', 'termsOfBusiness') as Record<string, string>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow">
        {/* Header */}
        <div className="bg-gradient-to-b from-[oklch(0.22_0.07_195)] to-[oklch(0.25_0.06_195)] text-white py-12">
          <div className="container">
            <h1 className="text-4xl font-bold mb-2">{tob.title}</h1>
            <p className="text-white/70">{tob.lastUpdated}</p>
          </div>
        </div>

        {/* Content */}
        <div className="container py-12">
          <div className="max-w-3xl mx-auto prose prose-invert">
            {/* Section 1 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section1Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section1Content}</p>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section2Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section2Content}</p>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section3Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section3Content}</p>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section4Title}</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{tob.section4_1Title}</h3>
                <p className="text-foreground/80 leading-relaxed">{tob.section4_1Content}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{tob.section4_2Title}</h3>
                <p className="text-foreground/80 leading-relaxed">{tob.section4_2Content}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{tob.section4_3Title}</h3>
                <p className="text-foreground/80 leading-relaxed">{tob.section4_3Content}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{tob.section4_4Title}</h3>
                <p className="text-foreground/80 leading-relaxed">{tob.section4_4Content}</p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section5Title}</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{tob.section5_1Title}</h3>
                <p className="text-foreground/80 leading-relaxed">{tob.section5_1Content}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{tob.section5_2Title}</h3>
                <p className="text-foreground/80 leading-relaxed">{tob.section5_2Content}</p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section6Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section6Content}</p>
            </div>

            {/* Section 7 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section7Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section7Content}</p>
            </div>

            {/* Section 8 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section8Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section8Content}</p>
            </div>

            {/* Section 9 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section9Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section9Content}</p>
            </div>

            {/* Section 10 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section10Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section10Content}</p>
            </div>

            {/* Section 11 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section11Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section11Content}</p>
            </div>

            {/* Section 12 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section12Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section12Content}</p>
            </div>

            {/* Section 13 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section13Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section13Content}</p>
            </div>

            {/* Section 14 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section14Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section14Content}</p>
            </div>

            {/* Section 15 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{tob.section15Title}</h2>
              <p className="text-foreground/80 leading-relaxed">{tob.section15Content}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
