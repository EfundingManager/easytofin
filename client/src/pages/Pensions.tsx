import ServicePage from "@/components/ServicePage";

const pensionProducts = [
  {
    title: "Personal Retirement Savings Account (PRSA)",
    description: "A PRSA (Personal Retirement Savings Account) is a flexible, tax-efficient retirement solution that gives you access to a range of investment funds. If your employer does not offer a company pension scheme, they are legally required to provide access to a standard PRSA.",
    href: "/services/pensions/prsa",
  },
  {
    title: "Additional Voluntary Contributions (AVCs)",
    description: "Top up your existing occupational pension to maximise your retirement fund and take full advantage of available tax relief on contributions.",
    href: "/services/pensions/avcs",
  },
  {
    title: "Occupational Pension Schemes",
    description: "Employer-sponsored pension arrangements that allow both employer and employee contributions. We advise both employers on scheme design and employees on maximising their benefits.",
    href: "/services/pensions/occupational",
  },
  {
    title: "Executive Pension Plans",
    description: "Designed for company directors and senior executives, offering higher contribution limits and greater flexibility than standard occupational pension schemes.",
    href: "/services/pensions/executive",
  },
  {
    title: "Approved Retirement Fund (ARF)",
    description: "An ARF lets you invest your remaining pension after taking your lump sum, with tax-efficient growth. Minimum withdrawals apply from age 61, which can be drawn as a DMF.",
    href: "/services/pensions/arf",
  },
];

export default function Pensions() {
  return (
    <ServicePage
      subServices={pensionProducts}
    />
  );
}
