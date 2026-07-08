export type Identity = "Student" | "Worker";

export type MoodType = "happy" | "okay" | "crazy" | "calm";

export interface PlayerAccount {
  name: string;
  password?: string;
  motto: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isCustom?: boolean;
}

export interface EnergyFieldResponse {
  fieldType: string;
  threatLevel: number;
  vibeRating: string;
  translation: string;
  survivalGuide: string[];
  slackingRisk: string;
}

export interface TribunalResponse {
  caseName: string;
  defendant: string;
  crime: string;
  verdict: string;
  sentence: string;
  catharsisIndex: number;
  judgeNotes: string;
}

export interface LongTermGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface VentingMessage {
  id: string;
  text: string;
  timestamp: number;
  x: number; // floating coordinate %
  y: number; // floating coordinate %
  color: string; // custom text color
  speed: number; // floating speed multiplier
}

export interface HistoryItem {
  id: string;
  type: "energy" | "tribunal" | "slack_session";
  title: string;
  subtitle: string;
  timestamp: number;
  details: any;
}

export interface FavoriteItem {
  id: string;
  type: "energy" | "tribunal";
  title: string;
  subtitle: string;
  timestamp: number;
  data: any;
}
