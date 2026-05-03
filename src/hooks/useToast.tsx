import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastVariant = "info" | "success" | "warn" | "danger";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  push: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto rounded-lg border px-4 py-2 text-sm shadow-lg backdrop-blur",
              t.variant === "success" &&
                "bg-green-500/15 border-green-500/40 text-green-200",
              t.variant === "warn" && "bg-yellow-500/15 border-yellow-500/40 text-yellow-200",
              t.variant === "danger" && "bg-red-500/15 border-red-500/40 text-red-200",
              t.variant === "info" && "bg-camp-surface border-camp-border text-zinc-100",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
