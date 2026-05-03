import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialCampers,
  initialKitchen,
  initialShifts,
  initialSpacing,
  initialPoints,
} from "../data/seed-data";
import type { CampData } from "../data/types";

const STORAGE_KEY = "low-effort-camp-data";
const DEBOUNCE_MS = 500;

function buildSeedData(): CampData {
  const extra: Record<string, { additional: number; reason: string }> = {};
  for (const p of initialPoints) {
    if (p.additional > 0 || p.reason) {
      extra[p.name] = { additional: p.additional, reason: p.reason };
    }
  }
  return {
    campers: initialCampers,
    shifts: initialShifts,
    spacing: initialSpacing,
    kitchen: initialKitchen,
    extraPoints: extra,
  };
}

function loadInitial(): CampData {
  if (typeof window === "undefined") return buildSeedData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedData();
    const parsed = JSON.parse(raw) as Partial<CampData>;
    const seed = buildSeedData();
    return {
      campers: parsed.campers ?? seed.campers,
      shifts: parsed.shifts ?? seed.shifts,
      spacing: parsed.spacing ?? seed.spacing,
      kitchen: parsed.kitchen ?? seed.kitchen,
      extraPoints: parsed.extraPoints ?? seed.extraPoints,
    };
  } catch (err) {
    console.warn("Failed to load camp data, falling back to seed", err);
    return buildSeedData();
  }
}

export function useCampData() {
  const [data, setData] = useState<CampData>(() => loadInitial());
  const timer = useRef<number | null>(null);

  // debounced save
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.warn("Failed to save camp data", err);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [data]);

  const updateCamper = useCallback((id: number, patch: Partial<CampData["campers"][number]>) => {
    setData((d) => ({
      ...d,
      campers: d.campers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const setAttendance = useCallback(
    (id: number, day: string, status: "confirmed" | "maybe" | "no") => {
      setData((d) => ({
        ...d,
        campers: d.campers.map((c) =>
          c.id === id ? { ...c, attendance: { ...c.attendance, [day]: status } } : c,
        ),
      }));
    },
    [],
  );

  const addCamperToShift = useCallback((shiftId: string, day: string, name: string) => {
    setData((d) => ({
      ...d,
      shifts: d.shifts.map((s) => {
        if (s.id !== shiftId) return s;
        const existing = s.days[day] ?? [];
        if (existing.includes(name)) return s;
        return { ...s, days: { ...s.days, [day]: [...existing, name] } };
      }),
    }));
  }, []);

  const removeCamperFromShift = useCallback((shiftId: string, day: string, name: string) => {
    setData((d) => ({
      ...d,
      shifts: d.shifts.map((s) => {
        if (s.id !== shiftId) return s;
        const existing = s.days[day] ?? [];
        return { ...s, days: { ...s.days, [day]: existing.filter((n) => n !== name) } };
      }),
    }));
  }, []);

  const updateKitchenItem = useCallback(
    (index: number, patch: Partial<CampData["kitchen"][number]>) => {
      setData((d) => ({
        ...d,
        kitchen: d.kitchen.map((k, i) => (i === index ? { ...k, ...patch } : k)),
      }));
    },
    [],
  );

  const updateExtraPoints = useCallback((name: string, additional: number, reason: string) => {
    setData((d) => {
      const next = { ...d.extraPoints };
      if (!additional && !reason) {
        delete next[name];
      } else {
        next[name] = { additional, reason };
      }
      return { ...d, extraPoints: next };
    });
  }, []);

  const replaceData = useCallback((next: CampData) => {
    setData(next);
  }, []);

  const resetToSeed = useCallback(() => {
    setData(buildSeedData());
  }, []);

  return {
    data,
    setData,
    updateCamper,
    setAttendance,
    addCamperToShift,
    removeCamperFromShift,
    updateKitchenItem,
    updateExtraPoints,
    replaceData,
    resetToSeed,
  };
}

export type UseCampData = ReturnType<typeof useCampData>;
