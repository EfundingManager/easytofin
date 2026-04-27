import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
      <Globe size={18} className="text-gray-600" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'en' | 'zh' | 'pl')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              language === lang.code
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={lang.label}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    </div>
  );
}
