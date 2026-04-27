import ServicePage from "@/components/ServicePage";

const PROTECTION_PRODUCTS = [
  {
    title: "Life Assurance",
    description: "A lump sum paid to your family in the event of your death, ensuring they can maintain their standard of living and meet financial obligations such as bills and other commitments.",
    href: "/protection/life-assurance",
  },
  {
    title: "Specified Serious Illness Cover",
    description: "A tax-free lump sum paid on diagnosis of a specified serious illness such as cancer, heart attack or stroke. Gives you financial breathing room to focus on recovery.",
    href: "/protection/serious-illness",
  },
  {
    title: "Income Protection",
    description: "Replaces a portion of your income if you are unable to work due to illness or injury. Provides long-term financial security when you need it most.",
    href: "/protection/income-protection",
  },
  {
    title: "Accident & Sickness Cover",
    description: "Short-term income replacement cover that pays a weekly benefit if you are unable to work due to an accident or sickness. Ideal for self-employed individuals.",
    href: "/protection/accident-sickness",
  },
  {
    title: "Personal Accident Plan",
    description: "Provides cash benefits and lump sum payments in the event of accidental injury, fractures or hospitalisation. Complements your existing health insurance.",
    href: "/protection/personal-accident",
  },
];

export default function Protection() {
  return (
    <ServicePage
      subServices={PROTECTION_PRODUCTS}
    />
  );
}
