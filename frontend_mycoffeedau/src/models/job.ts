import type { JobRequirements } from "./jobrequirements";

export interface Job {
  id: string;
  position: string;
  location: string;
  salary: string;
  type: "Full-time" | "Part-time";
  description: string;
  requirements: JobRequirements[];
  deadline: string;
}