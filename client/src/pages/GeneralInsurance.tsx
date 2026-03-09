import { Building2 } from "lucide-react";
import ServicePage from "@/components/ServicePage";

export default function GeneralInsurance() {
  return (
    <ServicePage
      title="General Insurance"
      tagline="Comprehensive cover for home, motor and business"
      heroDescription="General insurance protects your most valuable assets — your home, your car and your business. As independent brokers, we have access to a wide panel of insurers and can find you the right cover at a competitive price. We take the hassle out of insurance, handling everything from quotes to claims support."
      icon={<Building2 size={28} />}
      subServices={[
        {
          title: "Home Insurance",
          description: "Buildings and contents cover for your home. We compare policies from leading insurers to find the right level of protection for your property and possessions at the best price.",
        },
        {
          title: "Motor Insurance",
          description: "Car, van and motorcycle insurance from Ireland's leading providers. Whether you need comprehensive, third party fire & theft or third party only cover, we find the best deal for you.",
        },
        {
          title: "Business Insurance",
          description: "Tailored insurance solutions for businesses of all sizes, including public liability, employers' liability, professional indemnity, commercial property and business interruption cover.",
        },
        {
          title: "Landlord Insurance",
          description: "Specialist cover for property investors and landlords, including buildings cover, loss of rent, public liability and legal expenses. Protects your investment and your income.",
        },
        {
          title: "Travel Insurance",
          description: "Single trip and annual multi-trip travel insurance for individuals and families. Cover for medical emergencies, cancellation, baggage and more — worldwide.",
        },
        {
          title: "Liability Insurance",
          description: "Public liability, employers' liability and professional indemnity insurance for businesses and sole traders. Protects you against claims from third parties.",
        },
      ]}
      whySection={{
        title: "Independent Brokers Working for You",
        points: [
          "As independent brokers, we are not tied to any single insurer — we work for you.",
          "We compare quotes from a wide panel of Ireland's leading general insurers.",
          "Our advisors ensure you have the right level of cover — not just the cheapest option.",
          "We provide claims support and act as your advocate if you need to make a claim.",
          "Annual renewal reviews ensure you're always getting the best available deal.",
          "Specialist cover available for non-standard risks and unique circumstances.",
        ],
      }}
      relatedServices={[
        { label: "Protection", href: "/protection" },
        { label: "Health Insurance", href: "/health-insurance" },
        { label: "Mortgages", href: "/mortgages" },
      ]}
    />
  );
}
