import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import { rules } from "../data/seed-data";
import { computePoints, statusForCamper } from "../lib/points";
import { useIdentity } from "../hooks/useIdentity";
import { useToast } from "../hooks/useToast";
import type { UseSheetSync } from "../hooks/useSheetSync";
import type { Camper } from "../data/types";
import { cn } from "../lib/cn";

type SortKey = "name" | "total" | "attendedDays" | "transport" | "status";

function countAttendedDays(c: Camper) {
  return Object.values(c.attendance).filter((v) => v === "confirmed" || v === "maybe").length;
}

export function PointsPage({ camp }: { camp: UseSheetSync }) {
  const points = useMemo(() => computePoints(camp.data), [camp.data]);
  const pointsByName = useMemo(() => new Map(points.map((p) => [p.name, p])), [points]);
  const { me } = useIdentity();

  const [sort, setSort] = useState<SortKey>("total");
  const [desc, setDesc] = useState(true);

  const [rulesOpen, setRulesOpen] = useState(false);
  const [recsOpen, setRecsOpen] = useState(false);
  const toast = useToast();

  const meFirst = [...camp.data.campers].sort((a, b) => {
    const pa = pointsByName.get(a.name);
    const pb = pointsByName.get(b.name);
    if (sort === "name") return desc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    if (sort === "total") return desc ? (pb?.total ?? 0) - (pa?.total ?? 0) : (pa?.total ?? 0) - (pb?.total ?? 0);
    if (sort === "attendedDays") return desc ? countAttendedDays(b) - countAttendedDays(a) : countAttendedDays(a) - countAttendedDays(b);
    if (sort === "transport") return desc ? b.transport.localeCompare(a.transport) : a.transport.localeCompare(b.transport);
    return 0;
  });

  const setSortKey = (key: SortKey) => {
    if (sort === key) setDesc((d) => !d);
    else { setSort(key); setDesc(key !== "name"); }
  };

  const sorted = useMemo(() => {
    const pinned = me ? meFirst.filter((c) => c.id === me.id) : [];
    const rest = me ? meFirst.filter((c) => c.id !== me.id) : meFirst;
    return [...pinned, ...rest];
  }, [meFirst, me]);

  const copyTable = () => {
    const lines = [
      ["Name", "Points", "Days", "Transport", "Fee Paid"].join("\t"),
      ...sorted.map((c) => {
        const p = pointsByName.get(c.name);
        return [c.name, p?.total ?? 0, countAttendedDays(c), c.transport, c.campFeePaid ? "Yes" : "No"].join("\t");
      }),
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(
      () => toast.push("Copied", "success"),
      () => toast.push("Copy failed", "danger"),
    );
  };

  const ruleItems = [
    `Min points (build/strike): ${rules.minPoints}`,
    `Min points (no build/strike): ${rules.minPointsNoBuildStrike}`,
    `Build/strike bonus: +${rules.buildStrikeBonus} pts`,
    `Lead role bonus: +${rules.leadRoleBonus} pts`,
    `Fri/Sat dinner bonus: +${rules.friSatDinnerBonus} pts`,
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Points</h1>
          <p className="text-gray-400 text-sm mt-0.5">Live camp point balance &amp; reward tracking</p>
        </div>
        <button onClick={copyTable} className="btn-secondary text-xs">
          <Copy size={14} /> Copy table
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={() => setRulesOpen(!rulesOpen)}
          className="card flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
        >
          <div>
            <div className="font-medium text-sm text-gray-700">Point rules</div>
            <div className="text-xs text-gray-400">How points are earned and spent</div>
          </div>
          {rulesOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        <button
          onClick={() => setRecsOpen(!recsOpen)}
          className="card flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
        >
          <div>
            <div className="font-medium text-sm text-gray-700">Recommendations</div>
            <div className="text-xs text-gray-400">Who needs to pick up more shifts</div>
          </div>
          {recsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
      </div>

      {rulesOpen && (
        <div className="card">
          <div className="space-y-2">
            {ruleItems.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-orange-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recsOpen && (
        <div className="card">
          <Recommender campers={camp.data.campers} pointsByName={pointsByName} />
        </div>
      )}

      <div className="table-wrapper bg-white">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <SortHeader label="Name" active={sort === "name"} desc={desc} onClick={() => setSortKey("name")} />
              <th className="w-16 text-right">Total</th>
              <th className="w-14 text-right">Days</th>
              <th className="w-14 text-center">Fee</th>
              <th>Transport</th>
              <th className="w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => {
              const isMe = me?.id === c.id;
              const p = pointsByName.get(c.name);
              const s = statusForCamper(c, p);
              const rank = i + 1;
              return (
                <tr key={c.id} className={cn(isMe && "bg-orange-50/50")}>
                  <td className="text-xs text-gray-400">{isMe ? <span className="text-orange-500">★</span> : rank}</td>
                  <td className={cn("font-medium", isMe ? "text-orange-700" : "text-gray-700")}>
                    {c.name} {isMe && <span className="text-[10px] text-orange-400">(you)</span>}
                  </td>
                  <td className="text-right font-bold text-gray-900">{p?.total ?? 0}</td>
                  <td className="text-right text-gray-500">{countAttendedDays(c)}</td>
                  <td className="text-center">
                    {c.campFeePaid ? (
                      <span className="badge-success text-[10px]">paid</span>
                    ) : (
                      <span className="badge-muted text-[10px]">open</span>
                    )}
                  </td>
                  <td className="text-gray-600">{c.transport || "—"}</td>
                  <td>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        s.tone === "success" && "bg-green-100 text-green-700",
                        s.tone === "warn" && "bg-amber-100 text-amber-700",
                        s.tone === "danger" && "bg-red-100 text-red-700",
                      )}
                    >
                      {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({ label, active, desc, onClick }: { label: string; active: boolean; desc: boolean; onClick: () => void }) {
  return (
    <th className="cursor-pointer select-none" onClick={onClick}>
      <div className="flex items-center gap-1">
        {label}
        {active && (desc ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
      </div>
    </th>
  );
}

function Recommender({ campers, pointsByName }: { campers: Camper[]; pointsByName: Map<string, ReturnType<typeof computePoints>[number]>; }) {
  const [q, setQ] = useState(10);
  const needsMore = campers
    .map((c) => ({ camper: c, status: statusForCamper(c, pointsByName.get(c.name)) }))
    .filter((x) => x.status.tone !== "success")
    .sort((a, b) => (pointsByName.get(a.camper.name)?.total ?? 0) - (pointsByName.get(b.camper.name)?.total ?? 0));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <label className="label">Reward threshold</label>
        <input
          type="range"
          min={5}
          max={30}
          value={q}
          onChange={(e) => setQ(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm font-bold text-orange-600">{q} pts</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {needsMore.map((x) => (
          <span key={x.camper.id} className={x.status.tone === "warn" ? "badge-warn" : "badge-danger"}>
            {x.camper.name} · {x.status.label}
          </span>
        ))}
        {needsMore.length === 0 && (
          <span className="badge-success">Everyone is on track — nice work!</span>
        )}
      </div>
    </div>
  );
}
