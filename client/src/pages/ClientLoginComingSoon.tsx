import React, { useState, useEffect } from "react";
import { Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function ClientLoginComingSoon() {
  const { language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Target date: April 17, 2026 at 00:00:00 GMT+1
      const targetDate = new Date("2026-04-17T00:00:00+01:00").getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.40_0.10_155)] via-[oklch(0.45_0.08_155)] to-[oklch(0.35_0.12_155)] flex flex-col items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Clock className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-[Outfit]">
            {language === "en"
              ? "Coming Soon"
              : language === "zh"
              ? "即将推出"
              : "Wkrótce"}
          </h1>
          <p className="text-lg text-white/80 font-inter">
            {language === "en"
              ? "Client Login Portal"
              : language === "zh"
              ? "客户登录门户"
              : "Portal Logowania Klienta"}
          </p>
        </div>

        {/* Message */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 space-y-3">
          <p className="text-white/90 font-inter leading-relaxed">
            {language === "en"
              ? "We're preparing an enhanced Client Login experience for you. Our team is working hard to bring you the best features."
              : language === "zh"
              ? "我们正在为您准备增强的客户登录体验。我们的团队正在努力为您提供最佳功能。"
              : "Przygotowujemy dla Ciebie ulepszone doświadczenie logowania klienta. Nasz zespół pracuje nad najlepszymi funkcjami."}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="space-y-4">
          <p className="text-white/70 text-sm font-inter uppercase tracking-widest">
            {language === "en"
              ? "Re-opening in"
              : language === "zh"
              ? "重新开放于"
              : "Ponownie otwiera się za"}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: timeRemaining.days, label: language === "en" ? "Days" : language === "zh" ? "天" : "Dni" },
              { value: timeRemaining.hours, label: language === "en" ? "Hours" : language === "zh" ? "小时" : "Godziny" },
              { value: timeRemaining.minutes, label: language === "en" ? "Mins" : language === "zh" ? "分钟" : "Minuty" },
              { value: timeRemaining.seconds, label: language === "en" ? "Secs" : language === "zh" ? "秒" : "Sekundy" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 space-y-2"
              >
                <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-xs text-white/60 font-inter">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Relaunch Date */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-white/70 text-sm font-inter">
            {language === "en"
              ? "Relaunching on"
              : language === "zh"
              ? "重新启动于"
              : "Ponowne uruchomienie"}
          </p>
          <p className="text-xl font-bold text-white font-[Outfit] mt-1">
            April 17, 2026
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-2">
          <p className="text-white/70 text-sm font-inter">
            {language === "en"
              ? "Need help? Contact us"
              : language === "zh"
              ? "需要帮助？联系我们"
              : "Potrzebujesz pomocy? Skontaktuj się z nami"}
          </p>
          <div className="space-y-1">
            <a
              href="tel:1800008888"
              className="block text-white hover:text-white/80 transition-colors font-inter text-sm"
            >
              📞 1800 008888
            </a>
            <a
              href="mailto:info@easytofin.com"
              className="block text-white hover:text-white/80 transition-colors font-inter text-sm"
            >
              ✉️ info@easytofin.com
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 font-inter font-semibold"
        >
          <ArrowLeft size={18} />
          {language === "en"
            ? "Back to Home"
            : language === "zh"
            ? "返回首页"
            : "Wróć do domu"}
        </Link>
      </div>
    </div>
  );
}
