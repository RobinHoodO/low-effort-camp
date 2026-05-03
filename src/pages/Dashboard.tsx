import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Apple,
  Car,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Download,
  Flame,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Trophy,
  Upload,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { dayLabels } from "../data/seed-data";
import { computePoints, statusForCamper } from "../lib/points";
import { useToast } from "../hooks/useToast";
import { useIdentity } from "../hooks/useIdentity";
import { exportCampData, importCampData } from "../hooks/useExport";
import type { UseSheetSync } from "../hooks/useSheetSync";
import type { Camper } from "../data/types";
import { cn } from "../lib/cn";
import { Link } from "wouter";

export function DashboardPage({ camp }: { camp: UseSheetSync }) {
  const { data, status, lastSync, USE_SHEETS, refreshFromSheets } = camp;
  const toast = useToast();
  const { me } = useIdentity();

  const points = useMemo(() => computePoints(data), [data]);
  const pointsByName = useMemo(() => new Map(points.map((p) => [p.name, p])), [points]);

  const totalCampers = data.campers.length;
  const paidCount = data.campers.filter((c) => c.campFeePaid).length;
  const carDrivers = data.campers.filter((c) =>
    /car|van|rv|bobil|hiace|golf|harley|hilux|truck/i.test(c.transport),
  ).length;
  const needsRide = data.campers.filter((c) =>
    /need|rideshare|fly|copenhagen|rent/i.test(c.transport),
  ).length;

  const dietaryList = data.campers.filter((c) => c.dietary.trim());
  const allergyList = data.campers.filter((c) => c.allergies.trim());

  const dayCounts = dayLabels.map((d) => ({
    ...d,
    confirmed: data.campers.filter((c) => c.attendance[d.key] === "confirmed").length,
    maybe: data.campers.filter((c) => c.attendance[d.key] === "maybe").length,
  }));

  const peakDay = dayCounts.reduce((acc, d) => (d.confirmed > acc.confirmed ? d : acc), dayCounts[0]);

  const lowPointsAlerts = data.campers.filter((c) => {
    const status = statusForCamper(c, pointsByName.get(c.name));
    return status.tone !== "success";
  });

  const missingTransportAlerts = data.campers.filter((c) => !c.transport.trim());

  const copyEmergencyContacts = async () => {
    const lines = data.campers
      .filter((c) => c.phone || c.email)
      .map((c) => `${c.name} — ${c.phone || "no phone"} — ${c.email || "no email"}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.push("Emergency contacts copied", "success");
    } catch {
      toast.push("Couldn't copy.", "danger");
    }
  };

  const onExport = () => {
    exportCampData(data);
    toast.push("Exported", "success");
  };

  const onImport = async (file: File) => {
    try {
      const next = await importCampData(file);
      camp.replaceData(next);
      toast.push("Imported", "success");
    } catch (err) {
      toast.push("Import failed: " + (err as Error).message, "danger");
    }
  };

  const myPoints = me ? pointsByName.get(me.name) : undefined;
  const myStatus = me ? statusForCamper(me, myPoints) : null;
  const myShifts = useMemo(() => {
    if (!me) return [];
    const out: { shift: string; day: string; points: number }[] = [];
    for (const s of data.shifts) {
      for (const [day, names] of Object.entries(s.days)) {
        if (names.includes(me.name)) {
          out.push({ shift: s.name, day, points: s.points });
        }
      }
    }
    return out;
  }, [data.shifts, me]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-orange-500">
          <Flame size={16} />
          <span className="text-xs font-semibold uppercase tracking-widest">Camp HQ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1 text-gray-900">
          {me ? `Hey, ${me.name.split(" ")[0]}` : "Low Effort Leftovers"}
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Borderland 2026 · Build Aug 15 · Event Aug 20–26 · Strike Aug 27
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Campers" value={totalCampers} hint={`${paidCount} paid`} />
        <StatCard icon={MapPin} label="Peak day" value={peakDay.confirmed} hint={peakDay.label} />
        <StatCard icon={Car} label="Transport" value={carDrivers} hint={`${needsRide} need rides`} />
        <StatCard icon={Apple} label="Dietary" value={dietaryList.length} hint="restrictions" />
        <StatCard icon={ShieldAlert} label="Allergies" value={allergyList.length} hint="people" />
      </section>

      {/* My Status */}
      {me && (
        <section className="card bg-orange-50/50 border-orange-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm">
                {me.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{me.name}</div>
                <div className="text-xs text-gray-400">
                  {myShifts.length} shift{myShifts.length !== 1 ? "s" : ""} · {myPoints?.total ?? 0} points
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {myStatus && (
                <span className={myStatus.tone === "success" ? "badge-success" : myStatus.tone === "warn" ? "badge-warn" : "badge-danger"}>
                  {myStatus.label} pts
                </span>
              )}
              {me.campFeePaid ? <span className="badge-success">paid</span> : <span className="badge-muted">fee open</span>}
            </div>
          </div>
          {myShifts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-orange-100 flex flex-wrap gap-2">
              {myShifts.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-white border border-orange-100 rounded-lg px-2 py-1 text-gray-600">
                  <span className="text-orange-500 font-semibold">{s.points}p</span>
                  <span className="text-gray-300">·</span>
                  {s.shift} <span className="text-gray-400">{s.day.slice(0, 3)}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Timeline */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Camp Timeline</h2>
          <span className="text-xs text-gray-400">Click a day to toggle your attendance</span>
        </div>
        <Timeline dayCounts={dayCounts} totalCampers={totalCampers} me={me} camp={camp} />
      </section>

      {/* Alerts */}
      {(lowPointsAlerts.length > 0 || missingTransportAlerts.length > 0) && (
        <section className="grid lg:grid-cols-2 gap-4">
          {lowPointsAlerts.length > 0 && (
            <div className="card border-amber-100 bg-amber-50/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-amber-500" size={16} />
                <h2 className="font-semibold text-gray-900">Points alerts</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowPointsAlerts.slice(0, 6).map((c) => {
                  const s = statusForCamper(c, pointsByName.get(c.name));
                  return (
                    <span key={c.id} className={s.tone === "warn" ? "badge-warn" : "badge-danger"}>
                      {c.name} · {s.label}
                    </span>
                  );
                })}
                {lowPointsAlerts.length > 6 && (
                  <span className="badge-muted">+{lowPointsAlerts.length - 6} more</span>
                )}
              </div>
            </div>
          )}
          {missingTransportAlerts.length > 0 && (
            <div className="card border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Car className="text-gray-400" size={16} />
                <h2 className="font-semibold text-gray-900">Missing transport</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingTransportAlerts.slice(0, 6).map((c) => (
                  <span key={c.id} className="badge-muted">{c.name}</span>
                ))}
                {missingTransportAlerts.length > 6 && (
                  <span className="badge-muted">+{missingTransportAlerts.length - 6} more</span>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Campers */}
      <Collapsible title="Campers" defaultOpen icon={Users} badge={totalCampers}>
        <CampersSection camp={camp} />
      </Collapsible>

      {/* Shifts Preview */}
      <Collapsible title="Shifts" defaultOpen={false} icon={CalendarDays} badge={myShifts.length}>
        {myShifts.length === 0 ? (
          <p className="text-sm text-gray-400">No shifts yet. <Link href="/shifts" className="text-orange-500 hover:underline">Sign up →</Link></p>
        ) : (
          <div className="space-y-2">
            {myShifts.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{s.shift}</span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className="text-gray-400">{s.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-accent">{s.points}p</span>
                  <button
                    onClick={() => {
                      const shift = data.shifts.find((sh) =>
                        Object.entries(sh.days).some(([d, names]) => d === s.day && names.includes(me!.name))
                      );
                      if (shift) camp.removeCamperFromShift(shift.id, s.day, me!.name);
                    }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <Link href="/shifts" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-1">
              Manage all shifts <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </Collapsible>

      {/* Points Preview */}
      <Collapsible title="Points" defaultOpen={false} icon={Trophy}>
        <div className="space-y-2">
          {points.slice(0, 5).map((p, i) => {
            const isMe = me?.name === p.name;
            return (
              <div key={p.name} className={cn("flex items-center justify-between rounded-lg px-3 py-2", isMe ? "bg-orange-50" : "bg-gray-50")}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <span className={cn("text-sm font-medium", isMe ? "text-orange-700" : "text-gray-700")}>
                    {p.name} {isMe && <span className="text-[10px] text-orange-400">(you)</span>}
                  </span>
                </div>
                <span className="text-sm font-bold text-orange-500">{p.total}p</span>
              </div>
            );
          })}
          <Link href="/points" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-1">
            Full points table <ChevronRight size={14} />
          </Link>
        </div>
      </Collapsible>

      {/* Kitchen */}
      <Collapsible title="Kitchen" defaultOpen={false} icon={UtensilsCrossed} badge={data.kitchen.length}>
        <div className="space-y-2">
          {data.kitchen.map((item, idx) => (
            <label key={idx} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={item.confirmed}
                onChange={(e) => camp.updateKitchenItem(idx, { confirmed: e.target.checked })}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <div className="flex-1">
                <div className="text-sm text-gray-700">
                  {item.item} {item.size && <span className="text-gray-400">({item.size})</span>}
                </div>
                <div className="text-xs text-gray-400">
                  {item.provider} {item.bringer && `→ ${item.bringer}`}
                </div>
              </div>
            </label>
          ))}
        </div>
      </Collapsible>

      {/* Layout */}
      <Collapsible title="Spacing" defaultOpen={false} icon={MapPin} badge={data.spacing.length}>
        <div className="grid sm:grid-cols-2 gap-2">
          {data.spacing.map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-sm font-medium text-gray-700">{s.who}</div>
              <div className="text-xs text-gray-400">
                {s.type} · {s.size} {s.notes && <span className="text-gray-300">· {s.notes}</span>}
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      {/* Footer */}
      <section className="card bg-gray-50 border-gray-100">
        <div className="flex flex-wrap gap-3">
          <button onClick={onExport} className="btn-secondary text-xs">
            <Download size={14} /> Export JSON
          </button>
          <label className="btn-secondary text-xs cursor-pointer">
            <Upload size={14} /> Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          </label>
          <button onClick={copyEmergencyContacts} className="btn-secondary text-xs">
            <ClipboardCopy size={14} /> Emergency contacts
          </button>
          <button onClick={() => camp.resetToSeed()} className="btn-ghost text-xs text-gray-400">
            <RotateCcw size={14} /> Reset
          </button>
          {USE_SHEETS && (
            <button onClick={refreshFromSheets} className="btn-ghost text-xs text-gray-400">
              <RefreshCw size={14} /> Refresh
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", status === "idle" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-amber-400")} />
            {status === "idle" ? "Synced" : status}
          </span>
          {lastSync && <span>Last sync: {lastSync.toLocaleTimeString()}</span>}
          {!USE_SHEETS && <span>· Offline mode — changes saved locally</span>}
        </div>
      </section>
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = false, icon: Icon, badge }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number | string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-gray-400" />}
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {badge !== undefined && <span className="badge-muted">{badge}</span>}
        </div>
        <ChevronDown size={16} className={cn("text-gray-400 transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

function StatCard({ icon: Icon, label, value, hint }: {
  icon: typeof Users;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="card flex flex-col gap-1">
      <div className="flex items-center justify-between text-gray-400">
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        <Icon size={14} />
      </div>
      <div className="text-2xl font-bold tracking-tight text-gray-900">{value}</div>
      {hint && <div className="text-xs text-gray-400">{hint}</div>}
    </div>
  );
}

function Timeline({ dayCounts, totalCampers, me, camp }: {
  dayCounts: { key: string; label: string; phase: string; confirmed: number; maybe: number }[];
  totalCampers: number;
  me: Camper | null;
  camp: UseSheetSync;
}) {
  const max = Math.max(totalCampers, 1);
  return (
    <div className="space-y-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${dayCounts.length}, minmax(0, 1fr))` }}>
        {dayCounts.map((d) => {
          const h = Math.round((d.confirmed / max) * 100);
          const m = Math.round((d.maybe / max) * 100);
          const myStatus = me?.attendance[d.key];
          return (
            <button
              key={d.key}
              onClick={() => {
                if (!me) return;
                const next = myStatus === "confirmed" ? "maybe" : myStatus === "maybe" ? "no" : "confirmed";
                camp.setAttendance(me.id, d.key, next);
              }}
              className="flex flex-col items-center gap-1 min-w-0 group"
              title={me ? `You: ${myStatus}· Click to toggle` : `${d.label}: ${d.confirmed} confirmed`}
            >
              <div className="relative w-full h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group-hover:border-orange-200 transition-colors">
                <div className="absolute bottom-0 inset-x-0 bg-orange-200" style={{ height: `${h + m}%` }} />
                <div className="absolute bottom-0 inset-x-0 bg-orange-500" style={{ height: `${h}%` }} />
                {me && myStatus === "confirmed" && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white shadow-sm" />
                )}
              </div>
              <div className="text-[10px] text-gray-400 truncate w-full text-center">{d.label}</div>
              <div className="text-xs font-semibold text-gray-700">{d.confirmed}</div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 text-[11px] text-gray-400">
        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">Build · Aug 15–19</span>
        <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 border border-orange-100">Event · Aug 20–26</span>
        <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-600 border border-purple-100">Strike · Aug 27</span>
      </div>
    </div>
  );
}

function CampersSection({ camp }: { camp: UseSheetSync }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { me } = useIdentity();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return camp.data.campers.filter((c) =>
      !q || [c.name, c.email, c.phone, c.dietary, c.allergies, c.transport].join(" ").toLowerCase().includes(q)
    );
  }, [camp.data.campers, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search campers…"
          className="input pl-8 text-sm"
        />
      </div>

      <div className="space-y-1">
        {filtered.map((c) => {
          const isMe = me?.id === c.id;
          const isExpanded = expandedId === c.id;
          return (
            <div
              key={c.id}
              className={cn(
                "rounded-xl border transition-colors",
                isMe ? "border-orange-200 bg-orange-50/30" : "border-gray-100 bg-white",
                isExpanded && "shadow-sm",
              )}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  isMe ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500",
                )}>
                  {c.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-medium", isMe ? "text-orange-700" : "text-gray-700")}>
                    {c.name} {isMe && <span className="text-[10px] text-orange-400">(you)</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <AttendanceMiniStrip camper={c} camp={camp} editable={isMe} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {c.dietary && <span title={c.dietary}><Apple size={12} className="text-green-500" /></span>}
                  {c.allergies && <span title={c.allergies}><ShieldAlert size={12} className="text-red-400" /></span>}
                  {c.transport && <span title={c.transport}><Car size={12} className="text-gray-400" /></span>}
                  <ChevronDown size={14} className={cn("text-gray-300 transition-transform", isExpanded && "rotate-180")} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-50 pt-3">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <Field label="Email" value={c.email} onChange={(v) => camp.updateCamper(c.id, { email: v })} />
                    <Field label="Phone" value={c.phone} onChange={(v) => camp.updateCamper(c.id, { phone: v })} />
                    <Field label="Dietary" value={c.dietary} onChange={(v) => camp.updateCamper(c.id, { dietary: v })} />
                    <Field label="Allergies" value={c.allergies} onChange={(v) => camp.updateCamper(c.id, { allergies: v })} />
                    <Field label="Transport" value={c.transport} onChange={(v) => camp.updateCamper(c.id, { transport: v })} />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <CheckField label="Membership" checked={c.membership} onChange={(v) => camp.updateCamper(c.id, { membership: v })} />
                    <CheckField label="Fee paid" checked={c.campFeePaid} onChange={(v) => camp.updateCamper(c.id, { campFeePaid: v })} />
                    <CheckField label="Spacing" checked={c.spacingAdded} onChange={(v) => camp.updateCamper(c.id, { spacingAdded: v })} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No campers match.</p>
        )}
      </div>
    </div>
  );
}

function AttendanceMiniStrip({ camper, camp, editable }: { camper: Camper; camp: UseSheetSync; editable: boolean }) {
  return (
    <div className="flex gap-0.5">
      {dayLabels.map((d) => {
        const status = camper.attendance[d.key];
        let bg = "bg-gray-200";
        if (status === "confirmed") bg = "bg-orange-500";
        if (status === "maybe") bg = "bg-orange-200";
        return (
          <button
            key={d.key}
            disabled={!editable}
            onClick={(e) => {
              e.stopPropagation();
              const next = status === "confirmed" ? "maybe" : status === "maybe" ? "no" : "confirmed";
              camp.setAttendance(camper.id, d.key, next);
            }}
            title={`${d.label}: ${status}`}
            className={cn(
              "w-3.5 h-4 rounded-sm",
              bg,
              editable && "hover:ring-1 hover:ring-orange-300 cursor-pointer",
              !editable && "cursor-default",
            )}
          />
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label mb-1 block">{label}</span>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
      />
      {label}
    </label>
  );
}

function CalendarDays(props: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    </svg>
  );
}
