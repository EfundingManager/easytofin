import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

export default function PrivacyPolicy() {
  const { language } = useLanguage();

  const pp = t(language, 'privacyPolicy') as unknown as Record<string, string>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-2">{pp.title}</h1>
          <p className="text-white/80">{pp.lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-invert">
          {/* Introduction */}
          <section className="mb-8">
            <p className="text-lg leading-relaxed">{pp.introduction}</p>
          </section>

          {/* Section 1: Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section1Title}</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section1_1Title}</h3>
              <p className="text-base leading-relaxed">{pp.section1_1Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section1_2Title}</h3>
              <p className="text-base leading-relaxed">{pp.section1_2Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section1_3Title}</h3>
              <p className="text-base leading-relaxed">{pp.section1_3Content}</p>
            </div>
          </section>

          {/* Section 2: Legal Basis */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section2Title}</h2>
            <p className="text-base leading-relaxed">{pp.section2Content}</p>
          </section>

          {/* Section 3: How We Use Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section3Title}</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section3_1Title}</h3>
              <p className="text-base leading-relaxed">{pp.section3_1Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section3_2Title}</h3>
              <p className="text-base leading-relaxed">{pp.section3_2Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section3_3Title}</h3>
              <p className="text-base leading-relaxed">{pp.section3_3Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section3_4Title}</h3>
              <p className="text-base leading-relaxed">{pp.section3_4Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section3_5Title}</h3>
              <p className="text-base leading-relaxed">{pp.section3_5Content}</p>
            </div>
          </section>

          {/* Section 4: Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section4Title}</h2>
            <p className="text-base leading-relaxed">{pp.section4Intro}</p>
          </section>

          {/* Section 5: Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section5Title}</h2>
            <p className="text-base leading-relaxed">{pp.section5Content}</p>
          </section>

          {/* Section 6: Data Protection Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section6Title}</h2>
            <p className="text-base leading-relaxed mb-6">{pp.section6Intro}</p>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section6_1Title}</h3>
              <p className="text-base leading-relaxed">{pp.section6_1Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section6_2Title}</h3>
              <p className="text-base leading-relaxed">{pp.section6_2Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section6_3Title}</h3>
              <p className="text-base leading-relaxed">{pp.section6_3Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section6_4Title}</h3>
              <p className="text-base leading-relaxed">{pp.section6_4Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section6_5Title}</h3>
              <p className="text-base leading-relaxed">{pp.section6_5Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section6_6Title}</h3>
              <p className="text-base leading-relaxed">{pp.section6_6Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section6_7Title}</h3>
              <p className="text-base leading-relaxed">{pp.section6_7Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section6_8Title}</h3>
              <p className="text-base leading-relaxed">{pp.section6_8Content}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
              <p className="text-base leading-relaxed">{pp.section6Contact}</p>
            </div>
          </section>

          {/* Section 7: Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section7Title}</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section7_1Title}</h3>
              <p className="text-base leading-relaxed">{pp.section7_1Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section7_2Title}</h3>
              <p className="text-base leading-relaxed">{pp.section7_2Content}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{pp.section7_3Title}</h3>
              <p className="text-base leading-relaxed">{pp.section7_3Content}</p>
            </div>
          </section>

          {/* Section 8: Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section8Title}</h2>
            <p className="text-base leading-relaxed">{pp.section8Content}</p>
          </section>

          {/* Section 9: Third-Party Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section9Title}</h2>
            <p className="text-base leading-relaxed">{pp.section9Content}</p>
          </section>

          {/* Section 10: Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section10Title}</h2>
            <p className="text-base leading-relaxed">{pp.section10Content}</p>
          </section>

          {/* Section 11: Data Protection Officer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section11Title}</h2>
            <p className="text-base leading-relaxed mb-4">{pp.section11Content}</p>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <p className="text-base"><strong>Email:</strong> {pp.dpoEmail}</p>
              <p className="text-base"><strong>Address:</strong> {pp.dpoAddress}</p>
              <p className="text-base"><strong>Phone:</strong> {pp.dpoPhone}</p>
            </div>
          </section>

          {/* Section 12: Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section12Title}</h2>
            <p className="text-base leading-relaxed">{pp.section12Content}</p>
          </section>

          {/* Section 13: Regulatory Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section13Title}</h2>
            <p className="text-base leading-relaxed mb-4">{pp.section13Content}</p>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <p className="text-base"><strong>Address:</strong> {pp.cbAddress}</p>
              <p className="text-base"><strong>Phone:</strong> {pp.cbPhone}</p>
              <p className="text-base"><strong>Website:</strong> <a href={`https://${pp.cbWebsite}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{pp.cbWebsite}</a></p>
            </div>
          </section>

          {/* Section 14: Changes */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{pp.section14Title}</h2>
            <p className="text-base leading-relaxed">{pp.section14Content}</p>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-12">
            <p className="text-sm text-gray-600 dark:text-gray-400">{pp.lastUpdated}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
