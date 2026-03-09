/* 
 * EasyToFin Contact Page — "Warm Expertise" design
 * Contact form, office details, map placeholder, quick links
 */
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const services = [
  "Protection (Life, Illness, Income)",
  "Pensions & Retirement Planning",
  "Health Insurance",
  "General Insurance",
  "Mortgages",
  "Investments & Savings",
  "General Enquiry",
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.service) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Your enquiry has been sent! We'll be in touch shortly.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="teal-gradient text-white py-14 md:py-18">
        <div className="container">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/15 text-white/90 text-xs font-[Outfit] font-600 uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
              Get in Touch
            </span>
            <h1 className="font-[Outfit] font-800 text-4xl md:text-5xl text-white mb-4 leading-tight">
              We'd Love to Hear From You
            </h1>
            <p className="text-white/80 text-lg font-inter leading-relaxed">
              Book a free, no-obligation consultation with one of our expert advisors. We'll help you find the right financial solution for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact content */}
      <section className="py-16 bg-[oklch(0.97_0.003_240)]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <h2 className="font-[Outfit] font-700 text-xl text-[oklch(0.18_0.015_240)] mb-5">Contact Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[oklch(0.93_0.04_195)] flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-[oklch(0.40_0.11_195)]" />
                    </div>
                    <div>
                      <div className="text-xs text-[oklch(0.52_0.015_240)] font-inter uppercase tracking-wider mb-0.5">Phone</div>
                      <a href="tel:+35312345678" className="font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] hover:text-[oklch(0.40_0.11_195)] transition-colors">
                        +353 1 234 5678
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[oklch(0.93_0.04_195)] flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-[oklch(0.40_0.11_195)]" />
                    </div>
                    <div>
                      <div className="text-xs text-[oklch(0.52_0.015_240)] font-inter uppercase tracking-wider mb-0.5">Email</div>
                      <a href="mailto:info@easytofin.ie" className="font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] hover:text-[oklch(0.40_0.11_195)] transition-colors">
                        info@easytofin.ie
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[oklch(0.93_0.04_195)] flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-[oklch(0.40_0.11_195)]" />
                    </div>
                    <div>
                      <div className="text-xs text-[oklch(0.52_0.015_240)] font-inter uppercase tracking-wider mb-0.5">Address</div>
                      <div className="font-[Outfit] font-600 text-[oklch(0.18_0.015_240)] text-sm leading-relaxed">
                        EasyToFin Financial Services Limited<br />
                        Ireland
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[oklch(0.93_0.04_195)] flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-[oklch(0.40_0.11_195)]" />
                    </div>
                    <div>
                      <div className="text-xs text-[oklch(0.52_0.015_240)] font-inter uppercase tracking-wider mb-0.5">Office Hours</div>
                      <div className="font-inter text-sm text-[oklch(0.30_0.015_240)]">
                        Mon – Fri: 9:00am – 5:30pm<br />
                        Sat: 10:00am – 1:00pm
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory */}
              <div className="bg-white rounded-2xl p-5 border border-[oklch(0.88_0.008_240)]">
                <h3 className="font-[Outfit] font-600 text-sm text-[oklch(0.18_0.015_240)] mb-3">Regulatory Information</h3>
                <div className="space-y-2">
                  {[
                    "Regulated by the Central Bank of Ireland",
                    "Authorised Multi-Agency Intermediary",
                    "Professional Indemnity Insurance held",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[oklch(0.40_0.11_195)] shrink-0" />
                      <span className="text-xs text-[oklch(0.52_0.015_240)] font-inter">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 border border-[oklch(0.88_0.008_240)] shadow-sm">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-[oklch(0.93_0.04_195)] flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={32} className="text-[oklch(0.40_0.11_195)]" />
                    </div>
                    <h3 className="font-[Outfit] font-700 text-2xl text-[oklch(0.18_0.015_240)] mb-3">
                      Enquiry Received!
                    </h3>
                    <p className="text-[oklch(0.52_0.015_240)] font-inter text-base max-w-sm mx-auto">
                      Thank you for getting in touch. One of our advisors will contact you within one business day.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="font-[Outfit] font-700 text-xl text-[oklch(0.18_0.015_240)] mb-6">
                      Send Us an Enquiry
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-[Outfit] font-600 text-[oklch(0.30_0.015_240)] uppercase tracking-wider mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            className="w-full px-4 py-3 rounded-lg border border-[oklch(0.88_0.008_240)] bg-[oklch(0.97_0.003_240)] text-[oklch(0.18_0.015_240)] font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)] focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-[Outfit] font-600 text-[oklch(0.30_0.015_240)] uppercase tracking-wider mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 rounded-lg border border-[oklch(0.88_0.008_240)] bg-[oklch(0.97_0.003_240)] text-[oklch(0.18_0.015_240)] font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)] focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-[Outfit] font-600 text-[oklch(0.30_0.015_240)] uppercase tracking-wider mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+353 ..."
                            className="w-full px-4 py-3 rounded-lg border border-[oklch(0.88_0.008_240)] bg-[oklch(0.97_0.003_240)] text-[oklch(0.18_0.015_240)] font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)] focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-[Outfit] font-600 text-[oklch(0.30_0.015_240)] uppercase tracking-wider mb-1.5">
                            Service Interested In <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="service"
                            value={form.service}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-[oklch(0.88_0.008_240)] bg-[oklch(0.97_0.003_240)] text-[oklch(0.18_0.015_240)] font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)] focus:border-transparent transition-all"
                            required
                          >
                            <option value="" disabled>Select a service...</option>
                            {services.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-[Outfit] font-600 text-[oklch(0.30_0.015_240)] uppercase tracking-wider mb-1.5">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Tell us a bit about your situation and what you're looking for..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-[oklch(0.88_0.008_240)] bg-[oklch(0.97_0.003_240)] text-[oklch(0.18_0.015_240)] font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.11_195)] focus:border-transparent transition-all resize-none"
                        />
                      </div>
                      <div>
                        <button type="submit" className="btn-primary w-full justify-center py-3.5">
                          Send Enquiry <ArrowRight size={16} />
                        </button>
                        <p className="text-xs text-[oklch(0.52_0.015_240)] font-inter mt-3 text-center">
                          Free consultation · No obligation · Your data is kept confidential
                        </p>
                      </div>
                    </form>
                  </>
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
