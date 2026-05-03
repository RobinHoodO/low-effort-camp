import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  CalendarDays,
  Flame,
  LayoutDashboard,
  LogOut,
  Trophy,
  UserCircle,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useIdentity } from "../../hooks/useIdentity";
import type { UseSheetSync } from "../../hooks/useSheetSync";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shifts", label: "Shifts", icon: CalendarDays },
  { href: "/points", label: "Points", icon: Trophy },
];

export function AppShell({ camp, children }: { camp: UseSheetSync; children: ReactNode }) {
  const [location] = useLocation();
  const { me, campers, setMe, clearMe } = useIdentity();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Brand compact />
        <IdentityMini me={me} onClick={() => setShowPicker(true)} />
      </header>

      <div className="lg:flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-gray-100 bg-white min-h-screen sticky top-0">
          <div className="p-4 border-b border-gray-100">
            <Brand />
          </div>

          <div className="px-3 pt-3">
            <IdentityCard me={me} campers={campers} onSet={setMe} onClear={clearMe} />
          </div>

          <nav className="flex-1 p-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  camp.status === "error" && "bg-red-500",
                  camp.status === "offline" && "bg-amber-400",
                  camp.status === "loading" && "bg-orange-400 animate-pulse",
                  camp.status === "idle" && "bg-green-500",
                )}
              />
              {camp.status === "idle" ? "Synced" : camp.status === "offline" ? "Offline" : camp.status}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-screen-xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-100 grid grid-cols-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 gap-0.5 text-[11px] font-medium",
                active ? "text-orange-500" : "text-gray-400",
              )}
            >
              <Icon size={20} />
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
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs">
          {initials(me.name)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{me.name}</div>
          <div className="text-[10px] text-gray-400">Operating as you</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setOpen(true)} className="btn-secondary flex-1 text-xs py-1.5">
          Switch
        </button>
        <button onClick={onClear} className="btn-ghost p-1.5 text-gray-400" title="Log out">
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
          <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-[10px]">
            {initials(me.name)}
          </div>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">{me.name}</span>
        </>
      ) : (
        <>
          <UserCircle size={20} className="text-gray-400" />
          <span className="text-sm text-gray-400">Log in</span>
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
      <div className="absolute z-20 inset-x-0 top-0 bg-white border border-gray-100 rounded-xl shadow-xl p-2">
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
                "w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2",
                c.id === currentId ? "bg-orange-50 text-orange-600" : "hover:bg-gray-50 text-gray-700",
              )}
            >
              <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                {initials(c.name)}
              </span>
              {c.name}
            </button>
          ))}
          {list.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">No matches.</div>
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl w-full max-w-sm p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-900">Who are you?</div>
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
              className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 hover:bg-gray-50 text-gray-700"
            >
              <span className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-bold">
                {initials(c.name)}
              </span>
              {c.name}
            </button>
          ))}
          {list.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">No matches.</div>
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
    <div className="flex items-center gap-2.5">
      <div className="relative w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center">
        <Flame className="text-orange-500" size={20} />
      </div>
      <div>
        <div className="font-bold leading-tight tracking-tight text-gray-900">Low Effort</div>
        {!compact && (
          <div className="text-[11px] text-gray-400">Borderland 2026</div>
        )}
      </div>
    </div>
  );
}
