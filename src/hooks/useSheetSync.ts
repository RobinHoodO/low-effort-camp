import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialCampers,
  initialKitchen,
  initialShifts,
  initialSpacing,
  initialPoints,
} from "../data/seed-data";
import type { CampData } from "../data/types";

const GAS_URL = import.meta.env.VITE_GAS_URL || "";
const USE_SHEETS = Boolean(GAS_URL);
const STORAGE_KEY = "low-effort-camp-data";
const DEBOUNCE_MS = 800;

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
  } catch {
    return buildSeedData();
  }
}

export type SyncStatus = "idle" | "loading" | "syncing" | "error" | "offline";

export function useSheetSync() {
  const [data, setData] = useState<CampData>(() => loadInitial());
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const timer = useRef<number | null>(null);

  // Load from sheets on mount
  useEffect(() => {
    if (!USE_SHEETS) {
      setStatus("offline");
      return;
    }
    setStatus("loading");
    fetch(`${GAS_URL}?action=getAll`)
      .then((r) => r.json())
      .then((remote: Partial<CampData>) => {
        setData((local) => ({
          campers: remote.campers ?? local.campers,
          shifts: remote.shifts ?? local.shifts,
          spacing: remote.spacing ?? local.spacing,
          kitchen: remote.kitchen ?? local.kitchen,
          extraPoints: remote.extraPoints ?? local.extraPoints,
        }));
        setStatus("idle");
        setLastSync(new Date());
      })
      .catch(() => {
        setStatus("offline");
      });
  }, []);

  // Debounced localStorage save
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [data]);

  const post = useCallback(async (action: string, payload: Record<string, unknown>) => {
    if (!USE_SHEETS) return { success: true };
    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      return await res.json();
    } catch {
      return { error: "Network error" };
    }
  }, []);

  const updateCamper = useCallback((id: number, patch: Partial<CampData["campers"][number]>) => {
    setData((d) => ({
      ...d,
      campers: d.campers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    // Fire-and-forget sync for simple fields
    const field = Object.keys(patch)[0];
    if (field && ["email", "phone", "dietary", "allergies", "transport"].includes(field)) {
      post("updateCamper", { camperId: id, field, value: (patch as Record<string, unknown>)[field] });
    }
  }, [post]);

  const setAttendance = useCallback(
    (id: number, day: string, status: "confirmed" | "maybe" | "no") => {
      setData((d) => ({
        ...d,
        campers: d.campers.map((c) =>
          c.id === id ? { ...c, attendance: { ...c.attendance, [day]: status } } : c,
        ),
      }));
      post("updateAttendance", { camperId: id, day, status });
    },
    [post],
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
    post("updateShift", { shiftId, day, name, add: true });
  }, [post]);

  const removeCamperFromShift = useCallback((shiftId: string, day: string, name: string) => {
    setData((d) => ({
      ...d,
      shifts: d.shifts.map((s) => {
        if (s.id !== shiftId) return s;
        const existing = s.days[day] ?? [];
        return { ...s, days: { ...s.days, [day]: existing.filter((n) => n !== name) } };
      }),
    }));
    post("updateShift", { shiftId, day, name, add: false });
  }, [post]);

  const updateKitchenItem = useCallback(
    (index: number, patch: Partial<CampData["kitchen"][number]>) => {
      setData((d) => ({
        ...d,
        kitchen: d.kitchen.map((k, i) => (i === index ? { ...k, ...patch } : k)),
      }));
      const field = Object.keys(patch)[0];
      if (field) {
        post("updateKitchen", { index, field, value: (patch as Record<string, unknown>)[field] });
      }
    },
    [post],
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
    post("updateExtraPoints", { name, additional, reason });
  }, [post]);

  const replaceData = useCallback((next: CampData) => {
    setData(next);
  }, []);

  const resetToSeed = useCallback(() => {
    setData(buildSeedData());
  }, []);

  const refreshFromSheets = useCallback(async () => {
    if (!USE_SHEETS) return;
    setStatus("loading");
    try {
      const res = await fetch(`${GAS_URL}?action=getAll`);
      const remote = await res.json();
      setData((local) => ({
        campers: remote.campers ?? local.campers,
        shifts: remote.shifts ?? local.shifts,
        spacing: remote.spacing ?? local.spacing,
        kitchen: remote.kitchen ?? local.kitchen,
        extraPoints: remote.extraPoints ?? local.extraPoints,
      }));
      setStatus("idle");
      setLastSync(new Date());
    } catch {
      setStatus("error");
    }
  }, []);

  return {
    data,
    status,
    lastSync,
    USE_SHEETS,
    updateCamper,
    setAttendance,
    addCamperToShift,
    removeCamperFromShift,
    updateKitchenItem,
    updateExtraPoints,
    replaceData,
    resetToSeed,
    refreshFromSheets,
  };
}

export type UseSheetSync = ReturnType<typeof useSheetSync>;
