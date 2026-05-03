import { useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  CalendarDays,
  Download,
  Flame,
  Home,
  ListChecks,
  LogOut,
  MapPinned,
  RotateCcw,
  Trophy,
  Upload,
  UserCircle,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useToast } from "../../hooks/useToast";
import { useIdentity } from "../../hooks/useIdentity";
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
  const { me, campers, setMe, clearMe } = useIdentity();
  const [showPicker, setShowPicker] = useState(false);

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
        <div className="flex items-center gap-2">
          <IdentityMini me={me} onClick={() => setShowPicker(true)} />
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

          <div className="px-3 pt-3">
            <IdentityCard me={me} campers={campers} onSet={setMe} onClear={clearMe} />
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

      {showPicker && (
        <IdentityPickerModal
          campers={campers}
          onSelect={(id) => { setMe(id); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

function IdentityCard({
  me,
  campers,
  onSet,
  onClear,
}: {
  me: ReturnType<typeof useIdentity>["me"];
  campers: ReturnType<typeof useIdentity>["campers"];
  onSet: (id: number) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!me) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        <UserCircle size={16} /> Who are you?
      </button>
    );
  }
  return (
    <div className="rounded-lg border border-camp-border bg-camp-bg/60 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-camp-accent/20 border border-camp-accent/40 flex items-center justify-center text-amber-300 font-bold text-xs">
          {initials(me.name)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-100 truncate">{me.name}</div>
          <div className="text-[10px] text-zinc-400">Operating as you</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setOpen(true)} className="btn-secondary flex-1 text-xs py-1.5">
          Switch
        </button>
        <button onClick={onClear} className="btn-ghost p-1.5 text-zinc-400" title="Log out">
          <LogOut size={14} />
        </button>
      </div>
      {open && (
        <IdentityPickerPopover
          campers={campers}
          currentId={me.id}
          onSelect={(id) => { onSet(id); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function IdentityMini({ me, onClick }: { me: ReturnType<typeof useIdentity>["me"]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 btn-ghost py-1.5 px-2">
      {me ? (
        <>
          <div className="w-6 h-6 rounded-full bg-camp-accent/20 border border-camp-accent/40 flex items-center justify-center text-amber-300 font-bold text-[10px]">
            {initials(me.name)}
          </div>
          <span className="text-xs text-zinc-200 truncate max-w-[80px]">{me.name}</span>
        </>
      ) : (
        <>
          <UserCircle size={16} className="text-zinc-400" />
          <span className="text-xs text-zinc-400">Log in</span>
        </>
      )}
    </button>
  );
}

function IdentityPickerPopover({
  campers,
  currentId,
  onSelect,
  onClose,
}: {
  campers: ReturnType<typeof useIdentity>["campers"];
  currentId?: number;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const list = campers
    .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="mt-2 relative">
      <div className="absolute z-20 inset-x-0 top-0 bg-camp-surface border border-camp-border rounded-lg shadow-xl p-2">
        <input
          autoFocus
          className="input mb-1"
          placeholder="Search campers…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2",
                c.id === currentId ? "bg-camp-accent/15 text-amber-300" : "hover:bg-camp-bg text-zinc-200",
              )}
            >
              <span className="w-6 h-6 rounded-full bg-camp-bg border border-camp-border flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                {initials(c.name)}
              </span>
              {c.name}
            </button>
          ))}
          {list.length === 0 && (
            <div className="text-xs text-zinc-500 text-center py-2">No matches.</div>
          )}
        </div>
        <button onClick={onClose} className="btn-ghost w-full mt-1 text-xs py-1">
          Cancel
        </button>
      </div>
    </div>
  );
}

function IdentityPickerModal({
  campers,
  onSelect,
  onClose,
}: {
  campers: ReturnType<typeof useIdentity>["campers"];
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const list = campers
    .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-camp-surface border border-camp-border rounded-xl shadow-2xl w-full max-w-sm p-4 space-y-3">
        <div className="text-sm font-semibold text-zinc-100">Who are you?</div>
        <input
          autoFocus
          className="input"
          placeholder="Search campers…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="max-h-80 overflow-y-auto space-y-1">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 hover:bg-camp-bg text-zinc-200"
            >
              <span className="w-8 h-8 rounded-full bg-camp-bg border border-camp-border flex items-center justify-center text-xs text-zinc-400 font-bold">
                {initials(c.name)}
              </span>
              {c.name}
            </button>
          ))}
          {list.length === 0 && (
            <div className="text-sm text-zinc-500 text-center py-4">No matches.</div>
          )}
        </div>
        <button onClick={onClose} className="btn-ghost w-full text-sm py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
