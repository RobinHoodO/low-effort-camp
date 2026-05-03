import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { rules } from "../data/seed-data";
import { computePoints, statusForCamper } from "../lib/points";
import type { UseCampData } from "../hooks/useCampData";
import { useIdentity } from "../hooks/useIdentity";
import { cn } from "../lib/cn";

export function PointsPage({ camp }: { camp: UseCampData }) {
  const [query, setQuery] = useState("");
  const { me } = useIdentity();
  const points = useMemo(() => computePoints(camp.data), [camp.data]);

  const camperByName = useMemo(
    () => new Map(camp.data.campers.map((c) => [c.name, c])),
    [camp.data.campers],
  );

  const filtered = points.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  // pin me to top
  const sorted = useMemo(() => {
    if (!me) return filtered;
    const mine = filtered.find((p) => p.name === me.name);
    const rest = filtered.filter((p) => p.name !== me.name);
    return mine ? [mine, ...rest] : filtered;
  }, [filtered, me]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Points</h1>
          <p className="text-zinc-400 text-sm">
            Need {rules.minPoints}+ points if you do build/strike, otherwise{" "}
            {rules.minPointsNoBuildStrike}+.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input pl-9"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Rule label={`Build/strike bonus`} value={`+${rules.buildStrikeBonus}`} />
        <Rule label={`Lead role bonus`} value={`+${rules.leadRoleBonus}`} />
        <Rule label={`Fri/Sat dinner bonus`} value={`+${rules.friSatDinnerBonus}`} />
        <Rule label={`Min points`} value={`${rules.minPoints} / ${rules.minPointsNoBuildStrike}`} />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Camper</th>
              <th className="text-right">Total</th>
              <th className="text-right">1pt</th>
              <th className="text-right">2pt</th>
              <th className="text-right">3pt</th>
              <th className="text-right">Bonus</th>
              <th>Detail</th>
              <th>Status</th>
              <th>Manual + / reason</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const c = camperByName.get(p.name);
              const status = c
                ? statusForCamper(c, p)
                : { tone: "muted" as const, label: `${p.total} pts` };
              const isMe = me?.name === p.name;
              return (
                <tr key={p.name} className={isMe ? "bg-camp-accent/10" : undefined}>
                  <td className={cn("font-medium", isMe ? "text-amber-300" : "text-zinc-100")}>
                    {p.name} {isMe && <span className="text-[10px] text-amber-400/80">(you)</span>}
                  </td>
                  <td className="text-right font-bold text-amber-300">{p.total}</td>
                  <td className="text-right">{p.onePoint}</td>
                  <td className="text-right">{p.twoPoint}</td>
                  <td className="text-right">{p.threePoint}</td>
                  <td className="text-right">{p.additional}</td>
                  <td className="text-xs text-zinc-400 max-w-[220px]">{p.reason || "—"}</td>
                  <td>
                    <span
                      className={cn(
                        status.tone === "success" && "badge-success",
                        status.tone === "warn" && "badge-warn",
                        status.tone === "danger" && "badge-danger",
                        (status.tone as string) === "muted" && "badge-muted",
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <ExtraPointsCell
                      name={p.name}
                      additional={camp.data.extraPoints[p.name]?.additional ?? 0}
                      reason={camp.data.extraPoints[p.name]?.reason ?? ""}
                      onChange={(add, reason) => camp.updateExtraPoints(p.name, add, reason)}
                    />
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-zinc-500">
                  No matches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Rule({ label, value }: { label: string; value: string }) {
  return (
    <div className="card flex items-center justify-between">
      <span className="text-zinc-400">{label}</span>
      <span className="text-amber-300 font-bold">{value}</span>
    </div>
  );
}

function ExtraPointsCell({
  name,
  additional,
  reason,
  onChange,
}: {
  name: string;
  additional: number;
  reason: string;
  onChange: (additional: number, reason: string) => void;
}) {
  return (
    <div className="flex gap-1 items-center">
      <input
        type="number"
        min={0}
        value={additional || ""}
        placeholder="0"
        onChange={(e) => onChange(parseInt(e.target.value) || 0, reason)}
        className="input w-14 px-2 py-1 text-sm"
      />
      <input
        value={reason}
        placeholder="lead, repair, etc"
        onChange={(e) => onChange(additional, e.target.value)}
        className="input flex-1 px-2 py-1 text-sm"
        title={`Manual bonus for ${name}`}
      />
    </div>
  );
}
