import { useMemo } from "react";
import {
  AlertTriangle,
  Apple,
  Car,
  ClipboardCopy,
  Flame,
  HandHelping,
  ShieldAlert,
  Tent,
  Users,
} from "lucide-react";
import { dayLabels, rules } from "../data/seed-data";
import { computePoints, statusForCamper } from "../lib/points";
import { useToast } from "../hooks/useToast";
import { useIdentity } from "../hooks/useIdentity";
import type { UseCampData } from "../hooks/useCampData";

export function DashboardPage({ camp }: { camp: UseCampData }) {
  const { data } = camp;
  const toast = useToast();
  const { me } = useIdentity();

  const points = useMemo(() => computePoints(data), [data]);
  const pointsByName = useMemo(
    () => new Map(points.map((p) => [p.name, p])),
    [points],
  );

  const totalCampers = data.campers.length;
  const paidCount = data.campers.filter((c) => c.campFeePaid).length;
  const carDrivers = data.campers.filter((c) =>
    /car|van|rv|bobil|hiace|golf|harley|hilux|truck/i.test(c.transport),
  ).length;
  const needsRide = data.campers.filter((c) =>
    /need|rideshare|fly|copenhagen|rent/i.test(c.transport),
  ).length;

  const dietaryList = data.campers
    .filter((c) => c.dietary.trim())
    .map((c) => `${c.name}: ${c.dietary}`);
  const allergyList = data.campers
    .filter((c) => c.allergies.trim())
    .map((c) => `${c.name}: ${c.allergies}`);

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
      toast.push("Couldn't copy. Browser blocked clipboard.", "danger");
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
      <div>
        <div className="flex items-center gap-2 text-amber-300">
          <Flame size={18} className="ember" />
          <span className="text-sm uppercase tracking-widest">Camp HQ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">
          {me ? `Hey, ${me.name.split(" ")[0]}` : "Welcome to Low Effort Leftovers"}
        </h1>
        <p className="text-zinc-400 mt-1">
          Borderland 2026 — Build Aug 15 · Event Aug 20–26 · Strike Aug 27
        </p>
      </div>

      {me && (
        <section className="card border-camp-accent/30 bg-camp-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-camp-accent/20 border border-camp-accent/40 flex items-center justify-center text-amber-300 font-bold text-sm">
                {me.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-zinc-100">{me.name}</div>
                <div className="text-xs text-zinc-400">
                  {myShifts.length} shift{myShifts.length !== 1 ? "s" : ""} · {myPoints?.total ?? 0} points
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {myStatus && (
                <span
                  className={
                    myStatus.tone === "success"
                      ? "badge-success"
                      : myStatus.tone === "warn"
                        ? "badge-warn"
                        : "badge-danger"
                  }
                >
                  {myStatus.label} pts
                </span>
              )}
              {me.campFeePaid ? <span className="badge-success">paid</span> : <span className="badge-muted">fee open</span>}
            </div>
          </div>

          {myShifts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-camp-border/60">
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Your shifts</div>
              <div className="flex flex-wrap gap-2">
                {myShifts.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-camp-bg border border-camp-border rounded px-2 py-1 text-zinc-200">
                    <span className="text-amber-300 font-semibold">{s.points}p</span>
                    <span className="text-zinc-400">·</span>
                    {s.shift} <span className="text-zinc-500">{s.day.slice(0, 3)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Campers" value={totalCampers} hint={`${paidCount} paid`} />
        <StatCard
          icon={Tent}
          label="Peak day"
          value={peakDay.confirmed}
          hint={peakDay.label}
        />
        <StatCard
          icon={Car}
          label="With transport"
          value={carDrivers}
          hint={`${needsRide} need rides`}
        />
        <StatCard icon={Apple} label="Dietary" value={dietaryList.length} hint="restrictions" />
        <StatCard
          icon={ShieldAlert}
          label="Allergies"
          value={allergyList.length}
          hint="people"
        />
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Camp Timeline</h2>
          <span className="text-xs text-zinc-400">Confirmed bodies on each day</span>
        </div>
        <Timeline dayCounts={dayCounts} totalCampers={totalCampers} />
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-yellow-400" size={18} />
            <h2 className="font-semibold">Points alerts</h2>
            <span className="text-xs text-zinc-500">
              · need {rules.minPoints}+ pts (or {rules.minPointsNoBuildStrike}+ if not on build/strike)
            </span>
          </div>
          {lowPointsAlerts.length === 0 ? (
            <p className="text-sm text-zinc-400">Everyone hit the minimum. Nice.</p>
          ) : (
            <ul className="space-y-2">
              {lowPointsAlerts.slice(0, 8).map((c) => {
                const status = statusForCamper(c, pointsByName.get(c.name));
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between bg-camp-bg/60 rounded-md px-3 py-2 text-sm"
                  >
                    <span className="truncate">{c.name}</span>
                    <span className={status.tone === "warn" ? "badge-warn" : "badge-danger"}>
                      {status.label} pts
                    </span>
                  </li>
                );
              })}
              {lowPointsAlerts.length > 8 && (
                <li className="text-xs text-zinc-500 text-center pt-1">
                  +{lowPointsAlerts.length - 8} more — see Points tab
                </li>
              )}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <Car className="text-amber-300" size={18} />
            <h2 className="font-semibold">Transport gaps</h2>
          </div>
          {missingTransportAlerts.length === 0 ? (
            <p className="text-sm text-zinc-400">Everybody has a plan to get there.</p>
          ) : (
            <ul className="space-y-2">
              {missingTransportAlerts.slice(0, 8).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between bg-camp-bg/60 rounded-md px-3 py-2 text-sm"
                >
                  <span className="truncate">{c.name}</span>
                  <span className="badge-muted">no transport</span>
                </li>
              ))}
              {missingTransportAlerts.length > 8 && (
                <li className="text-xs text-zinc-500 text-center pt-1">
                  +{missingTransportAlerts.length - 8} more
                </li>
              )}
            </ul>
          )}
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <Apple className="text-green-400" size={18} />
            <h2 className="font-semibold">Dietary & allergies</h2>
          </div>
          {dietaryList.length + allergyList.length === 0 ? (
            <p className="text-sm text-zinc-400">No special requirements logged.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {dietaryList.map((line) => (
                <div key={"d-" + line} className="flex items-start gap-2">
                  <span className="badge-success">diet</span>
                  <span className="text-zinc-200">{line}</span>
                </div>
              ))}
              {allergyList.map((line) => (
                <div key={"a-" + line} className="flex items-start gap-2">
                  <span className="badge-warn">allergy</span>
                  <span className="text-zinc-200">{line}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <HandHelping className="text-amber-300" size={18} />
            <h2 className="font-semibold">Quick actions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyEmergencyContacts} className="btn-secondary">
              <ClipboardCopy size={16} /> Copy emergency contacts
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            Use the sidebar (or top icons on mobile) to export/import the camp database
            as a JSON file. Bring it on a USB stick if needed — this app works offline.
          </p>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="card flex flex-col gap-1">
      <div className="flex items-center justify-between text-zinc-400">
        <span className="label">{label}</span>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

function Timeline({
  dayCounts,
  totalCampers,
}: {
  dayCounts: { key: string; label: string; phase: string; confirmed: number; maybe: number }[];
  totalCampers: number;
}) {
  const max = Math.max(totalCampers, 1);
  return (
    <div className="space-y-3">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${dayCounts.length}, minmax(0, 1fr))` }}
      >
        {dayCounts.map((d) => {
          const h = Math.round((d.confirmed / max) * 100);
          const m = Math.round((d.maybe / max) * 100);
          return (
            <div key={d.key} className="flex flex-col items-center gap-1 min-w-0">
              <div className="relative w-full h-24 bg-camp-bg/60 rounded overflow-hidden border border-camp-border">
                <div
                  className="absolute bottom-0 inset-x-0 bg-yellow-500/30"
                  style={{ height: `${h + m}%` }}
                />
                <div
                  className="absolute bottom-0 inset-x-0 bg-camp-accent"
                  style={{ height: `${h}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-500 truncate w-full text-center">
                {d.label}
              </div>
              <div className="text-xs font-semibold text-zinc-200">{d.confirmed}</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 text-[11px] text-zinc-400">
        <PhaseTag color="bg-blue-500/20 border-blue-500/40">Build · Aug 15–19</PhaseTag>
        <PhaseTag color="bg-camp-accent/20 border-camp-accent/40">Event · Aug 20–26</PhaseTag>
        <PhaseTag color="bg-purple-500/20 border-purple-500/40">Strike · Aug 27</PhaseTag>
      </div>
    </div>
  );
}

function PhaseTag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className={`px-2 py-1 rounded border text-center ${color}`}>{children}</div>
  );
}
