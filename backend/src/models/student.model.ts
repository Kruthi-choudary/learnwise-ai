// Student and campus data shapes.

export interface CampusStudent {
  roll: string;
  name: string;
  dept: string;
  year: number;
  progress: number; // 0–100
  attendance: number; // 0–100
  status: "On track" | "Needs support" | "Placement ready";
}

export interface Opportunity {
  id: number;
  title: string;
  company: string;
  type: "Internship" | "Hackathon" | "Scholarship" | "Fellowship";
  logo: string;
  location: string;
  match: number; // 0–100 relevance score
  deadline: string;
  skills: string[];
  description: string;
  color: string;
}

export interface NavItem {
  title: string;
  path: string;
}

export interface Task {
  id: number;
  title: string;
  goal: string;
  duration: number; // minutes
  priority: string;
  color: string;
  done: boolean;
}

export interface Goal {
  title: string;
  subtitle: string;
  progress: number;
  color: string;
}
