import { TrendingUp } from "lucide-react";
import ServicePage from "@/components/ServicePage";

export default function Pensions() {
  return (
    <ServicePage
      title="Pensions"
      tagline="Plan the retirement you deserve"
      heroDescription="A pension is the most tax-efficient way to save for your retirement. The earlier you start, the better — but it's never too late to begin. Our pension specialists will assess your current position, explain your options clearly, and help you build a retirement fund that gives you financial independence."
      icon={<TrendingUp size={28} />}
      subServices={[
        {
          title: "Personal Pension Plans",
          description: "Ideal for self-employed individuals or those not in an occupational scheme. Contributions attract income tax relief, making them one of the most tax-efficient savings vehicles available.",
        },
        {
          title: "Occupational Pension Schemes",
          description: "Employer-sponsored pension arrangements that allow both employer and employee contributions. We advise both employers on scheme design and employees on maximising their benefits.",
        },
        {
          title: "Executive Pension Plans",
          description: "Designed for company directors and senior executives, offering higher contribution limits and greater flexibility than standard occupational schemes.",
        },
        {
          title: "Additional Voluntary Contributions (AVCs)",
          description: "Top up your existing occupational pension to maximise your retirement fund and take full advantage of available tax relief on contributions.",
        },
        {
          title: "Personal Retirement Savings Accounts (PRSAs)",
          description: "A flexible, portable pension product available to everyone, including those in employment, self-employment or not working. Low minimum contributions and easy to transfer.",
        },
        {
          title: "Approved Retirement Funds (ARFs)",
          description: "A post-retirement investment vehicle that allows you to keep your pension fund invested after retirement and draw down income as needed, with full control over your assets.",
        },
        {
          title: "Personal Retirement Bonds (PRBs)",
          description: "Used to transfer pension benefits when leaving an employer's scheme. Keeps your pension savings intact and growing until retirement.",
        },
        {
          title: "Annuities",
          description: "Provides a guaranteed income for life in retirement. We compare annuity rates from all providers to ensure you get the best possible income from your pension fund.",
        },
      ]}
      whySection={{
        title: "Start Planning Your Retirement Today",
        points: [
          "Pension contributions attract income tax relief at your marginal rate — 20% or 40%.",
          "The sooner you start, the more time your fund has to grow through compound returns.",
          "We analyse your existing pension arrangements and identify any gaps or inefficiencies.",
          "Our advisors are fully qualified and up to date with the latest pension legislation.",
          "We provide a clear, written Statement of Suitability for all pension recommendations.",
          "Regular pension reviews ensure your fund stays on track to meet your retirement goals.",
        ],
      }}
      relatedServices={[
        { label: "Protection", href: "/protection" },
        { label: "Investments", href: "/investments" },
        { label: "Contact Us", href: "/contact" },
      ]}
    />
  );
}
