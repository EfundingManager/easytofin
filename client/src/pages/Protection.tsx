import { Shield } from "lucide-react";
import ServicePage from "@/components/ServicePage";

export default function Protection() {
  return (
    <ServicePage
      title="Protection"
      tagline="Safeguard your family's financial future"
      heroDescription="Protection is the most important part of financial planning. It ensures that if the worst were to happen — through accident, serious illness or death — your family would have sufficient funds to maintain their lifestyle. Our expert advisors will help you find the right level of cover at the most competitive price."
      icon={<Shield size={28} />}
      subServices={[
        {
          title: "Life Assurance",
          description: "A lump sum paid to your family in the event of your death, ensuring they can maintain their standard of living and meet financial obligations such as mortgages and bills.",
        },
        {
          title: "Specified Serious Illness Cover",
          description: "A tax-free lump sum paid on diagnosis of a specified serious illness such as cancer, heart attack or stroke. Gives you financial breathing room to focus on recovery.",
        },
        {
          title: "Income Protection",
          description: "Replaces a portion of your income if you are unable to work due to illness or injury. Provides long-term financial security when you need it most.",
        },
        {
          title: "Accident & Sickness Cover",
          description: "Short-term income replacement cover that pays a weekly benefit if you are unable to work due to an accident or sickness. Ideal for self-employed individuals.",
        },
        {
          title: "Personal Accident Plan",
          description: "Provides cash benefits and lump sum payments in the event of accidental injury, fractures or hospitalisation. Complements your existing health insurance.",
        },
        {
          title: "Mortgage Protection",
          description: "Ensures your mortgage is paid off in the event of your death, protecting your family's home. A legal requirement for most mortgage holders in Ireland.",
        },
      ]}
      whySection={{
        title: "Why Protection Matters",
        points: [
          "Protection is the foundation of any solid financial plan — everything else builds on it.",
          "We compare products from all major Irish insurers including Aviva, Irish Life, Zurich, New Ireland and Royal London.",
          "Our advisors assess your individual needs and recommend the most appropriate level of cover.",
          "We help you avoid being under-insured — a common and costly mistake.",
          "Regular policy reviews ensure your cover remains relevant as your life changes.",
          "All advice is provided by qualified, regulated financial advisors.",
        ],
      }}
      relatedServices={[
        { label: "Pensions", href: "/pensions" },
        { label: "Health Insurance", href: "/health-insurance" },
        { label: "Mortgages", href: "/mortgages" },
      ]}
    />
  );
}
