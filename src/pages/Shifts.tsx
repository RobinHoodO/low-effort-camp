import { useMemo, useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { shiftDayLabels } from "../data/seed-data";
import type { Shift, ShiftCategory } from "../data/types";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../hooks/useToast";
import { useIdentity } from "../hooks/useIdentity";
import type { UseSheetSync } from "../hooks/useSheetSync";
import { computePoints, shiftFullness } from "../lib/points";
import { cn } from "../lib/cn";

const categoryOrder: ShiftCategory[] = ["LNT", "Breakfast", "Pre-Dinner", "Dinner"];
const categoryLabels: Record<ShiftCategory, string> = {
  LNT: "Leave No Trace",
  Breakfast: "Breakfast",
  "Pre-Dinner": "Pre-Dinner Cleanup",
  Dinner: "Dinner",
};
const categoryColor: Record<ShiftCategory, string> = {
  LNT: "border-l-blue-400",
  Breakfast: "border-l-amber-400",
  "Pre-Dinner": "border-l-purple-400",
  Dinner: "border-l-orange-400",
};

export function ShiftsPage({ camp }: { camp: UseSheetSync }) {
  const { me } = useIdentity();
  const [filterPerson, setFilterPerson] = useState<string>(me?.name ?? "");
  const [signupTarget, setSignupTarget] = useState<{ shiftId: string; day: string } | null>(null);

  useEffect(() => {
    if (me) setFilterPerson(me.name);
  }, [me?.name]);

  const points = useMemo(() => computePoints(camp.data), [camp.data]);
  const pointsByName = useMemo(() => new Map(points.map((p) => [p.name, p.total])), [points]);

  const personNames = useMemo(
    () => [...camp.data.campers.map((c) => c.name)].sort((a, b) => a.localeCompare(b)),
    [camp.data.campers],
  );

  const grouped = useMemo(() => {
    const map = new Map<ShiftCategory, Shift[]>();
    for (const s of camp.data.shifts) {
      const cat = s.category as ShiftCategory;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    }
    return map;
  }, [camp.data.shifts]);

  const isPersonShift = (shift: Shift, day: string) => {
    if (!filterPerson) return false;
    return (shift.days[day] ?? []).includes(filterPerson);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shifts</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Sign up to earn points. Click an empty slot to add yourself or a campmate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="label">Filter</label>
          <select
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
            className="input w-44"
          >
            <option value="">— show everyone —</option>
            {personNames.map((n) => (
              <option key={n} value={n}>
                {n}
                {pointsByName.get(n) != null ? ` · ${pointsByName.get(n)}p` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filterPerson && (
        <div className="card bg-orange-50/50 border-orange-100 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-orange-700">{filterPerson}</span>
            <span className="text-gray-500"> · {pointsByName.get(filterPerson) ?? 0} points</span>
          </div>
          <button onClick={() => setFilterPerson("")} className="btn-ghost text-gray-400 text-xs">
            Clear
          </button>
        </div>
      )}

      {categoryOrder.map((cat) => {
        const shifts = grouped.get(cat);
        if (!shifts || shifts.length === 0) return null;
        return (
          <section key={cat} className="space-y-2">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              {categoryLabels[cat]}
              <span className="text-xs text-gray-400 font-normal">({shifts.length} shifts)</span>
            </h2>
            <div className="grid gap-3">
              {shifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  highlightPerson={filterPerson}
                  matchPerson={(day) => isPersonShift(shift, day)}
                  onSlotClick={(day) => setSignupTarget({ shiftId: shift.id, day })}
                  onRemove={(day, name) => camp.removeCamperFromShift(shift.id, day, name)}
                  me={me?.name}
                  onSignMeUp={(day) => {
                    if (me) {
                      camp.addCamperToShift(shift.id, day, me.name);
                    } else {
                      setSignupTarget({ shiftId: shift.id, day });
                    }
                  }}
                />
              ))}
            </div>
          </section>
        );
      })}

      <SignupModal
        camp={camp}
        target={signupTarget}
        onClose={() => setSignupTarget(null)}
        defaultName={me?.name}
      />
    </div>
  );
}

function ShiftCard({
  shift,
  highlightPerson,
  matchPerson,
  onSlotClick,
  onRemove,
  me,
  onSignMeUp,
}: {
  shift: Shift;
  highlightPerson: string;
  matchPerson: (day: string) => boolean;
  onSlotClick: (day: string) => void;
  onRemove: (day: string, name: string) => void;
  me?: string;
  onSignMeUp: (day: string) => void;
}) {
  const totalFilled = shiftDayLabels.reduce(
    (acc, d) => acc + (shift.days[d] ?? []).length,
    0,
  );
  const totalCapacity = shift.slots ?? null;

  return (
    <div className={cn("card border-l-4 p-4", categoryColor[shift.category as ShiftCategory])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-800">{shift.name}</div>
          {shift.notes && (
            <p className="text-xs text-gray-400 mt-1 max-w-3xl">{shift.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="badge-accent">{shift.points} pt</span>
          {totalCapacity != null ? (
            <span className="badge-muted">{totalFilled}/{totalCapacity}</span>
          ) : (
            <span className="badge-muted">{totalFilled} signups</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2 grid-cols-7">
        {shiftDayLabels.map((day) => {
          const list = shift.days[day] ?? [];
          const fullness = shiftFullness(shift, day);
          const isMine = matchPerson(day);
          const imAlreadyOn = me ? list.includes(me) : false;
          return (
            <div
              key={day}
              className={cn(
                "rounded-lg border bg-gray-50/50 p-2 min-h-[72px] flex flex-col gap-1.5",
                isMine
                  ? "border-orange-300 ring-1 ring-orange-100"
                  : "border-gray-100",
              )}
            >
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                <span>{day.slice(0, 3)}</span>
                {fullness.slots != null && (
                  <span className={fullness.isFull ? "text-gray-300" : "text-gray-400"}>
                    {fullness.filled}/{fullness.slots}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {list.map((name) => (
                  <button
                    key={day + name}
                    onClick={() => onRemove(day, name)}
                    title="Click to remove"
                    className={cn(
                      "group flex items-center justify-between text-[11px] rounded-md px-2 py-1 truncate transition-colors",
                      highlightPerson && name === highlightPerson
                        ? "bg-orange-500 text-white font-semibold"
                        : "bg-white border border-gray-100 text-gray-600 hover:border-red-300 hover:text-red-500",
                    )}
                  >
                    <span className="truncate">{name}</span>
                    <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                {!imAlreadyOn && (
                  <button
                    onClick={() => (me ? onSignMeUp(day) : onSlotClick(day))}
                    className={cn(
                      "flex items-center justify-center gap-1 text-[11px] rounded-md border border-dashed py-1 transition-colors",
                      fullness.isFull
                        ? "border-gray-200 text-gray-300 hover:text-gray-400"
                        : "border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500",
                    )}
                  >
                    <Plus size={10} /> {me ? "me" : "add"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SignupModal({
  camp,
  target,
  onClose,
  defaultName,
}: {
  camp: UseSheetSync;
  target: { shiftId: string; day: string } | null;
  onClose: () => void;
  defaultName?: string;
}) {
  const toast = useToast();
  const [search, setSearch] = useState(defaultName ?? "");
  const [custom, setCustom] = useState("");

  if (!target) return null;
  const shift = camp.data.shifts.find((s) => s.id === target.shiftId);
  if (!shift) return null;

  const alreadyOn = new Set(shift.days[target.day] ?? []);
  const candidates = camp.data.campers
    .map((c) => c.name)
    .filter((n) => !alreadyOn.has(n))
    .filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const sign = (name: string) => {
    if (!name.trim()) return;
    camp.addCamperToShift(target.shiftId, target.day, name.trim());
    toast.push(`${name.trim()} signed up for ${shift.name} on ${target.day}`, "success");
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={`Sign up — ${shift.name} · ${target.day}`} widthClassName="sm:max-w-md">
      <div className="space-y-3">
        <input
          autoFocus
          className="input"
          placeholder="Search campers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
          {candidates.length === 0 && (
            <div className="p-3 text-center text-sm text-gray-400">No matches.</div>
          )}
          {candidates.map((name) => (
            <button
              key={name}
              onClick={() => sign(name)}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between text-gray-700"
            >
              <span>{name}</span>
              <Plus size={14} className="text-gray-400" />
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="label mb-1">Add a non-camper / placeholder</div>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="e.g. Friend of Erling"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
            <button onClick={() => sign(custom)} className="btn-primary shrink-0">
              Add
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
