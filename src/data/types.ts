export type {
  Camper,
  Shift,
  SpacingEntry,
  KitchenItem,
  CamperPoints,
  CampRules,
} from "./seed-data";

export type AttendanceStatus = "confirmed" | "maybe" | "no";

export type ShiftCategory = "LNT" | "Breakfast" | "Pre-Dinner" | "Dinner";

export interface CampData {
  campers: import("./seed-data").Camper[];
  shifts: import("./seed-data").Shift[];
  spacing: import("./seed-data").SpacingEntry[];
  kitchen: import("./seed-data").KitchenItem[];
  extraPoints: Record<string, { additional: number; reason: string }>;
}
