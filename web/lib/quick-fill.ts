import type { ProjectInput } from "@hackmaxx/shared";

export const quickFillProjects: ProjectInput[] = [
  {
    title: "AI tutor for vernacular students",
    description: "An AI tutoring app that works offline with local language support and voice input.",
    tech_stack: ["Next.js", "TypeScript", "Bedrock"],
    tags: ["AI", "EdTech", "India"],
  },
  {
    title: "Farm yield predictor",
    description: "Crop yield forecasting for Indian farmers using satellite data and weather APIs.",
    tech_stack: ["Python", "AWS Lambda", "DynamoDB"],
    tags: ["AgriTech", "Data", "ML"],
  },
  {
    title: "UPI split tracker for roommates",
    description: "Shared-expense tracker with UPI integration and automatic bill reconciliation.",
    tech_stack: ["React", "Node", "PostgreSQL"],
    tags: ["Fintech", "Payments", "DevTools"],
  },
  {
    title: "Hackathon idea incubator",
    description: "AI-powered tool that suggests hackathon ideas based on trending tech and team skills.",
    tech_stack: ["Next.js", "Bedrock", "Tailwind"],
    tags: ["AI", "DevTools", "Web"],
  },
  {
    title: "Open-source contributor matcher",
    description: "Connects newcomers to open-source projects based on skills and learning goals.",
    tech_stack: ["TypeScript", "API Gateway", "Lambda"],
    tags: ["OpenSource", "Community", "DevTools"],
  },
];
