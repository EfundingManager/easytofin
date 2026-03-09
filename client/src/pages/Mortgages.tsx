import { Home as HomeIcon } from "lucide-react";
import ServicePage from "@/components/ServicePage";

export default function Mortgages() {
  return (
    <ServicePage
      title="Mortgages"
      tagline="Your home, your way — we guide you every step"
      heroDescription="Buying a home is one of the biggest financial decisions you'll ever make. Our mortgage advisors take the stress out of the process, guiding you from initial application through to drawdown. We have access to all major lenders and will find the mortgage that best suits your circumstances and financial goals."
      icon={<HomeIcon size={28} />}
      subServices={[
        {
          title: "First-Time Buyer Mortgages",
          description: "Navigating your first mortgage can be daunting. We explain every step of the process, help you understand what you can borrow, and find the best rate available to you.",
        },
        {
          title: "Mover Mortgages",
          description: "Moving home? We'll assess your current mortgage, explore porting options, and find the best new deal — whether you're upsizing, downsizing or relocating.",
        },
        {
          title: "Remortgaging",
          description: "If your fixed rate is ending or you want to release equity, we'll compare the market and find a better deal. Switching your mortgage could save you thousands.",
        },
        {
          title: "Buy-to-Let Mortgages",
          description: "Investment property mortgages for landlords and property investors. We assess rental yield, loan-to-value requirements and find the most competitive rates available.",
        },
        {
          title: "Mortgage Protection Insurance",
          description: "A legal requirement for most mortgage holders in Ireland. We compare mortgage protection policies to ensure your home is protected at the best available price.",
        },
        {
          title: "Equity Release",
          description: "Access the equity in your home to fund home improvements, education or other major expenses. We explain all options and ensure you understand the implications.",
        },
      ]}
      whySection={{
        title: "Making Your Mortgage Journey Easier",
        points: [
          "We have access to all major Irish lenders including AIB, Bank of Ireland, Permanent TSB, Haven and more.",
          "Our mortgage advisors are fully qualified and experienced in all types of mortgage applications.",
          "We handle the paperwork and liaise with lenders on your behalf — saving you time and stress.",
          "We help you understand the Help to Buy scheme and First Home Scheme eligibility.",
          "Honest, impartial advice — we recommend the mortgage that's right for you, not the one that pays us most.",
          "We stay with you from application to drawdown, keeping you informed at every stage.",
        ],
      }}
      ctaText="Get Mortgage Advice"
      relatedServices={[
        { label: "Protection", href: "/protection" },
        { label: "General Insurance", href: "/general-insurance" },
        { label: "Investments", href: "/investments" },
      ]}
    />
  );
}
