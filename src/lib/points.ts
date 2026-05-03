import { rules } from "../data/seed-data";
import type { CampData, CamperPoints, Shift } from "../data/types";

const buildDays = ["Wed15", "Thu16", "Fri17", "Sat18", "Sun19"];
const strikeDays = ["Mon27"];

function isFriOrSat(day: string) {
  return day === "Friday" || day === "Saturday";
}

export function computePoints(data: CampData): CamperPoints[] {
  const result = new Map<string, CamperPoints>();

  // seed every camper with zero
  for (const c of data.campers) {
    result.set(c.name, {
      name: c.name,
      total: 0,
      onePoint: 0,
      twoPoint: 0,
      threePoint: 0,
      additional: 0,
      reason: "",
    });
  }

  // tally shifts
  for (const shift of data.shifts) {
    for (const [day, names] of Object.entries(shift.days)) {
      for (const rawName of names) {
        const name = rawName.trim();
        if (!name) continue;
        let entry = result.get(name);
        if (!entry) {
          entry = {
            name,
            total: 0,
            onePoint: 0,
            twoPoint: 0,
            threePoint: 0,
            additional: 0,
            reason: "",
          };
          result.set(name, entry);
        }
        let pts = shift.points;
        if (shift.category === "Dinner" && isFriOrSat(day)) {
          pts += 1;
        }
        if (pts === 1) entry.onePoint += 1;
        else if (pts === 2) entry.twoPoint += 1;
        else if (pts === 3) entry.threePoint += 1;
        entry.total += pts;
      }
    }
  }

  // tally build/strike bonuses from attendance
  for (const c of data.campers) {
    const entry = result.get(c.name);
    if (!entry) continue;
    const inBuild = buildDays.some((d) => c.attendance[d] === "confirmed");
    const inStrike = strikeDays.some((d) => c.attendance[d] === "confirmed");
    if (inBuild) {
      entry.total += rules.buildStrikeBonus;
      const tag = "build (+" + rules.buildStrikeBonus + ")";
      entry.reason = entry.reason ? `${entry.reason}, ${tag}` : tag;
    }
    if (inStrike) {
      entry.total += rules.buildStrikeBonus;
      const tag = "strike (+" + rules.buildStrikeBonus + ")";
      entry.reason = entry.reason ? `${entry.reason}, ${tag}` : tag;
    }
  }

  // tally manual extra points
  for (const [name, extra] of Object.entries(data.extraPoints)) {
    let entry = result.get(name);
    if (!entry) {
      entry = {
        name,
        total: 0,
        onePoint: 0,
        twoPoint: 0,
        threePoint: 0,
        additional: 0,
        reason: "",
      };
      result.set(name, entry);
    }
    entry.additional += extra.additional;
    entry.total += extra.additional;
    if (extra.reason) {
      entry.reason = entry.reason ? `${entry.reason}, ${extra.reason}` : extra.reason;
    }
  }

  return [...result.values()].sort((a, b) => b.total - a.total);
}

export function statusForCamper(c: { name: string; attendance: Record<string, string> }, points: CamperPoints | undefined) {
  const inBuildOrStrike =
    buildDays.some((d) => c.attendance[d] === "confirmed") ||
    strikeDays.some((d) => c.attendance[d] === "confirmed");
  const required = inBuildOrStrike ? rules.minPoints : rules.minPointsNoBuildStrike;
  const total = points?.total ?? 0;
  if (total >= required) return { tone: "success" as const, label: `${total}/${required}` };
  if (total > 0) return { tone: "warn" as const, label: `${total}/${required}` };
  return { tone: "danger" as const, label: `${total}/${required}` };
}

export function shiftFullness(shift: Shift, day: string) {
  const filled = (shift.days[day] ?? []).length;
  const slots = shift.slots;
  if (slots === null) return { filled, slots: null as number | null, isFull: false };
  return { filled, slots, isFull: filled >= slots };
}
