/* 
 * EasyToFin Contact Page — "Warm Expertise" design with bilingual support
 * Contact form, office hours, phone/email
 */
import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

export default function Contact() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="teal-gradient text-white py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white/90 text-xs font-[Outfit] font-600 uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
              {t(language, 'nav.contact')}
            </span>
            <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-white mb-4 leading-tight">
              {t(language, 'contact.title')}
            </h1>
            <p className="text-white/80 text-lg font-inter leading-relaxed max-w-2xl">
              {t(language, 'contact.contactDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="font-[Outfit] font-700 text-lg text-[oklch(0.18_0.015_240)] mb-4">
                  {t(language, 'contact.phone')}
                </h3>
                <a href="tel:+35312345678" className="flex items-center gap-3 text-[oklch(0.40_0.11_195)] hover:text-[oklch(0.32_0.09_195)] transition-colors">
                  <Phone size={20} className="shrink-0" />
                  <span className="font-inter">+353 1 234 5678</span>
                </a>
              </div>

              <div>
                <h3 className="font-[Outfit] font-700 text-lg text-[oklch(0.18_0.015_240)] mb-4">
                  {t(language, 'contact.email')}
                </h3>
                <a href="mailto:info@easytofin.ie" className="flex items-center gap-3 text-[oklch(0.40_0.11_195)] hover:text-[oklch(0.32_0.09_195)] transition-colors">
                  <Mail size={20} className="shrink-0" />
                  <span className="font-inter">info@easytofin.ie</span>
                </a>
              </div>

              <div>
                <h3 className="font-[Outfit] font-700 text-lg text-[oklch(0.18_0.015_240)] mb-4">
                  {language === 'en' ? 'Address' : '地址'}
                </h3>
                <div className="flex items-start gap-3 text-[oklch(0.30_0.015_240)]">
                  <MapPin size={20} className="shrink-0 mt-0.5 text-[oklch(0.40_0.11_195)]" />
                  <span className="font-inter text-sm">
                    EasyToFin Financial Services Limited<br />
                    Dublin, Ireland
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-[Outfit] font-700 text-lg text-[oklch(0.18_0.015_240)] mb-4">
                  {language === 'en' ? 'Office Hours' : '办公时间'}
                </h3>
                <div className="space-y-2 text-sm text-[oklch(0.30_0.015_240)] font-inter">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[oklch(0.40_0.11_195)]" />
                    <span>{t(language, 'contact.monFri')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[oklch(0.40_0.11_195)]" />
                    <span>{t(language, 'contact.sat')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-[oklch(0.97_0.003_240)] rounded-2xl p-8 border border-[oklch(0.88_0.008_240)]">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="font-[Outfit] font-700 text-lg text-[oklch(0.18_0.015_240)] mb-2">
                      {t(language, 'contact.enquiryReceived')}
                    </h3>
                    <p className="text-[oklch(0.52_0.015_240)] font-inter text-sm">
                      {t(language, 'contact.thankYou')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] mb-2">
                        {t(language, 'contact.fullName')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-[oklch(0.88_0.008_240)] bg-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)]"
                        placeholder={language === 'en' ? 'John Smith' : '李明'}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] mb-2">
                          {t(language, 'contact.emailAddress')}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-[oklch(0.88_0.008_240)] bg-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)]"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] mb-2">
                          {t(language, 'contact.phoneNumber')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-[oklch(0.88_0.008_240)] bg-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)]"
                          placeholder="+353 1 234 5678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] mb-2">
                        {t(language, 'contact.serviceInterested')}
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-[oklch(0.88_0.008_240)] bg-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)]"
                      >
                        <option value="">{t(language, 'contact.selectService')}</option>
                        <option value="protection">{t(language, 'services.protection')}</option>
                        <option value="pensions">{t(language, 'services.pensions')}</option>
                        <option value="health">{t(language, 'services.healthInsurance')}</option>
                        <option value="general">{t(language, 'services.generalInsurance')}</option>
                        <option value="mortgages">{t(language, 'services.mortgages')}</option>
                        <option value="investments">{t(language, 'services.investments')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] mb-2">
                        {t(language, 'contact.message')}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-2.5 rounded-lg border border-[oklch(0.88_0.008_240)] bg-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)] resize-none"
                        placeholder={language === 'en' ? 'Tell us a bit about your situation...' : '请告诉我们您的情况...'}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-amber w-full justify-center"
                    >
                      {t(language, 'contact.sendBtn')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
