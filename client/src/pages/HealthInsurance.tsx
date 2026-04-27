import ServicePage from "@/components/ServicePage";

const healthProducts = [
  {
    title: "Individual Health Insurance",
    description: "Comprehensive private health coverage for individuals with choice of hospitals and consultants.",
    href: "/services/health-insurance/individual",
  },
  {
    title: "Family Health Insurance",
    description: "Affordable health coverage for families with benefits for all family members.",
    href: "/services/health-insurance/family",
  },
  {
    title: "Group Health Insurance",
    description: "Employee health benefits for businesses providing comprehensive workplace health coverage.",
    href: "/services/health-insurance/group",
  },
  {
    title: "Senior Health Insurance",
    description: "Specialized health coverage designed for retirees and seniors over 65.",
    href: "/services/health-insurance/senior",
  },
];

export default function HealthInsurance() {
  return (
    <ServicePage
      subServices={healthProducts}
    />
  );
}
