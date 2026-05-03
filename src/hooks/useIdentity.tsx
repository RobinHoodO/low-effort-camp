import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Camper } from "../data/types";

const IDENTITY_KEY = "low-effort-camp-me";

interface IdentityCtx {
  me: Camper | null;
  campers: Camper[];
  setMe: (id: number) => void;
  clearMe: () => void;
}

const IdentityContext = createContext<IdentityCtx | null>(null);

function loadId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function IdentityProvider({ campers, children }: { campers: Camper[]; children: ReactNode }) {
  const [meId, setMeId] = useState<number | null>(() => loadId());

  useEffect(() => {
    if (meId == null) {
      window.localStorage.removeItem(IDENTITY_KEY);
    } else {
      window.localStorage.setItem(IDENTITY_KEY, String(meId));
    }
  }, [meId]);

  const me = meId == null ? null : campers.find((c) => c.id === meId) ?? null;

  const setMe = useCallback((id: number) => setMeId(id), []);
  const clearMe = useCallback(() => setMeId(null), []);

  return (
    <IdentityContext.Provider value={{ me, campers, setMe, clearMe }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityCtx {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within IdentityProvider");
  return ctx;
}
