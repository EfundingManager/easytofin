import { Heart } from "lucide-react";
import ServicePage from "@/components/ServicePage";

export default function HealthInsurance() {
  return (
    <ServicePage
      title="Health Insurance"
      tagline="Private medical cover for you and your family"
      heroDescription="Private health insurance gives you access to faster diagnosis, specialist consultations and private hospital treatment when you need it most. With so many plans available, choosing the right one can be overwhelming. Our health insurance specialists will compare the market and find the plan that best suits your needs and budget."
      icon={<Heart size={28} />}
      subServices={[
        {
          title: "Individual Health Plans",
          description: "Tailored private medical insurance for individuals, covering outpatient, inpatient and day-case treatments. We compare all major providers to find your best value plan.",
        },
        {
          title: "Family Health Plans",
          description: "Comprehensive cover for the whole family at competitive group rates. Children's cover is often included at reduced rates or free on many family plans.",
        },
        {
          title: "Corporate & Group Schemes",
          description: "Employer-sponsored health insurance schemes for businesses of all sizes. We handle the administration and annual renewal, ensuring your employees always have the best available cover.",
        },
        {
          title: "Hospital Cover",
          description: "Access to private and semi-private rooms in approved hospitals across Ireland. Avoid lengthy public waiting lists for elective procedures and specialist consultations.",
        },
        {
          title: "Everyday Health Benefits",
          description: "Plans that cover GP visits, dental, optical, physiotherapy and other everyday health expenses. Reduce your out-of-pocket costs for routine healthcare.",
        },
        {
          title: "Health Cash Plans",
          description: "Affordable plans that pay cash benefits towards everyday health expenses including GP visits, dental check-ups, optical care and physiotherapy sessions.",
        },
      ]}
      whySection={{
        title: "Why Private Health Insurance?",
        points: [
          "Skip lengthy public waiting lists and access specialist care when you need it.",
          "We compare plans from all major providers: VHI, Laya Healthcare, Irish Life Health and more.",
          "Our advisors identify the plan that gives you the best cover for your budget.",
          "Annual reviews ensure you're never paying for cover you don't need.",
          "We handle the switching process on your behalf — fast and hassle-free.",
          "Employer health schemes can be structured to be tax-efficient for both employer and employee.",
        ],
      }}
      relatedServices={[
        { label: "Protection", href: "/protection" },
        { label: "General Insurance", href: "/general-insurance" },
        { label: "Contact Us", href: "/contact" },
      ]}
    />
  );
}
