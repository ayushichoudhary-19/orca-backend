export const TRAINING_TYPES = [
  {
    type: "company_overview",
    title: "Company Overview",
    description:
      "Help callers understand your company, its background and vision for the future.",
  },
  {
    type: "product_overview",
    title: "Product Overview",
    description:
      "Share your product's story at a high level, including what you can do with it, the market needs, pain points and more.",
  },
  {
    type: "buyer_persona",
    title: "ICP / Buyer Persona",
    description:
      "Define the attributes of accounts and the personas of buyers that are expected to be valuable customers.",
  },
  {
    type: "competition",
    title: "Competition",
    description:
      "Describe your competition, how you differentiate from them and why you are better.",
  },
  {
    type: "qualification_criteria",
    title: "Qualification Criteria",
    description:
      "Define the criteria that a lead must meet to be considered a qualified lead.",
  },
  {
    type: "objection_handling",
    title: "Objection Handling",
    description:
      "Provide guidance on how to handle common objections and questions.",
  },
] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number]["type"];
