import { useRef, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  CalendarDays,
  Download,
  Flame,
  Home,
  ListChecks,
  MapPinned,
  RotateCcw,
  Trophy,
  Upload,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useToast } from "../../hooks/useToast";
import { exportCampData, importCampData } from "../../hooks/useExport";
import type { UseCampData } from "../../hooks/useCampData";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/campers", label: "Campers", icon: Users },
  { href: "/shifts", label: "Shifts", icon: CalendarDays },
  { href: "/points", label: "Points", icon: Trophy },
  { href: "/layout", label: "Layout", icon: MapPinned },
  { href: "/kitchen", label: "Kitchen", icon: UtensilsCrossed },
];

export function AppShell({ camp, children }: { camp: UseCampData; children: ReactNode }) {
  const [location] = useLocation();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    exportCampData(camp.data);
    toast.push("Camp data exported", "success");
  };

  const onImportClick = () => fileRef.current?.click();

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const next = await importCampData(file);
      camp.replaceData(next);
      toast.push("Camp data imported", "success");
    } catch (err) {
      console.error(err);
      toast.push("Import failed: " + (err as Error).message, "danger");
    }
  };

  const onReset = () => {
    if (
      window.confirm(
        "Reset all camp data to the seed values? This will wipe your changes from this device.",
      )
    ) {
      camp.resetToSeed();
      toast.push("Reset to seed data", "warn");
    }
  };

  return (
    <div className="min-h-full">
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        onChange={onImportFile}
        className="hidden"
      />

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-camp-bg/90 backdrop-blur border-b border-camp-border px-4 py-3 flex items-center justify-between">
        <Brand compact />
        <div className="flex gap-1">
          <button onClick={onExport} className="btn-ghost p-2" title="Export">
            <Download size={18} />
          </button>
          <button onClick={onImportClick} className="btn-ghost p-2" title="Import">
            <Upload size={18} />
          </button>
        </div>
      </header>

      <div className="lg:flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-camp-border bg-camp-surface min-h-screen sticky top-0">
          <div className="p-5 border-b border-camp-border">
            <Brand />
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-camp-accent/15 text-amber-300"
                      : "text-zinc-300 hover:bg-camp-bg hover:text-zinc-100",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-camp-border space-y-2">
            <button onClick={onExport} className="btn-secondary w-full">
              <Download size={16} /> Export JSON
            </button>
            <button onClick={onImportClick} className="btn-secondary w-full">
              <Upload size={16} /> Import JSON
            </button>
            <button onClick={onReset} className="btn-ghost w-full text-zinc-500 hover:text-zinc-200">
              <RotateCcw size={16} /> Reset to seed
            </button>
            <p className="text-[10px] text-zinc-500 text-center pt-2">
              <ListChecks size={10} className="inline mr-1" />
              Saved locally on this device
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-camp-surface/95 backdrop-blur border-t border-camp-border grid grid-cols-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 gap-0.5 text-[10px]",
                active ? "text-amber-300" : "text-zinc-400",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-lg bg-camp-accent/15 border border-camp-accent/30 flex items-center justify-center">
        <Flame className="ember text-amber-400" size={22} />
      </div>
      <div>
        <div className="font-bold leading-tight tracking-tight">Low Effort Leftovers</div>
        {!compact && (
          <div className="text-[11px] text-zinc-400">Borderland 2026 · camp HQ</div>
        )}
      </div>
    </div>
  );
}
