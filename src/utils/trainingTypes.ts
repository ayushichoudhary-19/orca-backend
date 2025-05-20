export const TRAINING_TYPES = [
  {
    type: "company_overview",
    title: "Company Overview",
    description:
      "Help caller understand the company, its background and vision for the future.",
  },
  {
    type: "product_overview",
    title: "Product Overview",
    description:
      "Product's story at a high level, including what can be done with it, the market needs, pain points and more.",
  },
  {
    type: "buyer_persona",
    title: "ICP / Buyer Persona",
    description:
      "The attributes of accounts and the personas of buyers that are expected to be valuable customers.",
  },
  {
    type: "competition",
    title: "Competition",
    description:
      "Description of the competition, how we differentiate from them and why we are better.",
  },
  {
    type: "qualification_criteria",
    title: "Qualification Criteria",
    description:
      "The criteria that a lead must meet to be considered a qualified lead.",
  },
  {
    type: "objection_handling",
    title: "Objection Handling",
    description: "Guidance on how to handle common objections and questions.",
  },
] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number]["type"];
