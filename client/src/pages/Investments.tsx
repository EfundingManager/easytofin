import { BarChart3 } from "lucide-react";
import ServicePage from "@/components/ServicePage";

export default function Investments() {
  return (
    <ServicePage
      title="Investments"
      tagline="Grow your wealth with confidence"
      heroDescription="Whether you have a lump sum to invest, want to save regularly, or are looking to diversify your existing portfolio, our investment advisors can help. We take the time to understand your financial goals, risk appetite and time horizon, then recommend a strategy that works for you."
      icon={<BarChart3 size={28} />}
      subServices={[
        {
          title: "Investment Bonds",
          description: "A tax-efficient way to invest a lump sum with access to a wide range of funds. Investment bonds offer flexibility, potential for growth and a range of risk levels to suit all investors.",
        },
        {
          title: "Regular Savings Plans",
          description: "Build wealth steadily through regular monthly contributions. Even small amounts invested consistently over time can grow significantly through the power of compound returns.",
        },
        {
          title: "Lump Sum Investments",
          description: "Put your savings to work with a one-off lump sum investment. We assess your goals and risk tolerance to recommend the most appropriate fund or portfolio.",
        },
        {
          title: "Portfolio Management",
          description: "For larger investment portfolios, we provide ongoing management and review services, ensuring your investments remain aligned with your goals and market conditions.",
        },
        {
          title: "Structured Products",
          description: "Capital-protected or capital-at-risk structured investment products that offer defined returns linked to market performance. Suitable for investors seeking certainty.",
        },
        {
          title: "Education Savings Plans",
          description: "Start saving for your children's education today. Regular savings plans with flexible access ensure funds are available when third-level costs arise.",
        },
      ]}
      whySection={{
        title: "Investing with EasyToFin",
        points: [
          "We assess your risk profile carefully before making any investment recommendation.",
          "Access to a wide range of investment funds from Ireland's leading providers.",
          "We explain investment risks clearly — no jargon, no surprises.",
          "Regular portfolio reviews keep your investments on track to meet your goals.",
          "Tax-efficient investment structures to maximise your after-tax returns.",
          "All investment advice is provided by qualified, regulated financial advisors.",
        ],
      }}
      ctaText="Explore Investment Options"
      relatedServices={[
        { label: "Pensions", href: "/pensions" },
        { label: "Protection", href: "/protection" },
        { label: "Contact Us", href: "/contact" },
      ]}
    />
  );
}
