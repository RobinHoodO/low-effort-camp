import { useMemo, useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { shiftDayLabels } from "../data/seed-data";
import type { Shift, ShiftCategory } from "../data/types";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../hooks/useToast";
import { useIdentity } from "../hooks/useIdentity";
import type { UseCampData } from "../hooks/useCampData";
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
  LNT: "border-l-blue-500/60",
  Breakfast: "border-l-yellow-500/60",
  "Pre-Dinner": "border-l-purple-500/60",
  Dinner: "border-l-camp-accent",
};

export function ShiftsPage({ camp }: { camp: UseCampData }) {
  const { me } = useIdentity();
  const [filterPerson, setFilterPerson] = useState<string>(me?.name ?? "");
  const [signupTarget, setSignupTarget] = useState<{ shiftId: string; day: string } | null>(null);

  // keep filter in sync when identity changes
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
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Shifts</h1>
          <p className="text-zinc-400 text-sm">
            Sign up to earn points. Click an empty slot to add yourself or a campmate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="label">My shifts</label>
          <select
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
            className="input w-48"
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
        <div className="card flex items-center justify-between bg-camp-accent/10 border-camp-accent/30">
          <div className="text-sm">
            <span className="font-semibold text-amber-300">{filterPerson}</span>
            <span className="text-zinc-300"> · {pointsByName.get(filterPerson) ?? 0} points so far</span>
          </div>
          <button onClick={() => setFilterPerson("")} className="btn-ghost text-zinc-300">
            Clear filter
          </button>
        </div>
      )}

      {categoryOrder.map((cat) => {
        const shifts = grouped.get(cat);
        if (!shifts || shifts.length === 0) return null;
        return (
          <section key={cat} className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">
              {categoryLabels[cat]}{" "}
              <span className="text-xs text-zinc-500">({shifts.length} shifts)</span>
            </h2>
            <div className="grid gap-2">
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
    <div className={cn("card border-l-4 p-3", categoryColor[shift.category as ShiftCategory])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-100">{shift.name}</div>
          {shift.notes && (
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">{shift.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="badge-accent">{shift.points} pt</span>
          {totalCapacity != null ? (
            <span className="badge-muted">
              {totalFilled}/{totalCapacity}
            </span>
          ) : (
            <span className="badge-muted">{totalFilled} signups</span>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-1 grid-cols-7">
        {shiftDayLabels.map((day) => {
          const list = shift.days[day] ?? [];
          const fullness = shiftFullness(shift, day);
          const isMine = matchPerson(day);
          const imAlreadyOn = me ? list.includes(me) : false;
          return (
            <div
              key={day}
              className={cn(
                "rounded-md border bg-camp-bg/40 p-1.5 min-h-[64px] flex flex-col gap-1",
                isMine
                  ? "border-camp-accent/60 ring-1 ring-camp-accent/30"
                  : "border-camp-border",
              )}
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{day.slice(0, 3)}</span>
                {fullness.slots != null && (
                  <span
                    className={cn(
                      fullness.isFull ? "text-zinc-400" : "text-zinc-500",
                    )}
                  >
                    {fullness.filled}/{fullness.slots}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                {list.map((name) => (
                  <button
                    key={day + name}
                    onClick={() => onRemove(day, name)}
                    title="Click to remove"
                    className={cn(
                      "group flex items-center justify-between text-[11px] rounded px-1.5 py-0.5 truncate",
                      highlightPerson && name === highlightPerson
                        ? "bg-camp-accent text-black font-semibold"
                        : "bg-camp-surface border border-camp-border text-zinc-200 hover:border-red-500/40 hover:text-red-300",
                    )}
                  >
                    <span className="truncate">{name}</span>
                    <X
                      size={10}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                ))}
                {!imAlreadyOn && (
                  <button
                    onClick={() => me ? onSignMeUp(day) : onSlotClick(day)}
                    className={cn(
                      "flex items-center justify-center gap-1 text-[11px] rounded border border-dashed py-0.5 transition-colors",
                      fullness.isFull
                        ? "border-camp-border/60 text-zinc-600 hover:text-zinc-400"
                        : "border-camp-border text-zinc-400 hover:border-camp-accent hover:text-amber-300",
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
  camp: UseCampData;
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
    <Modal
      open
      onClose={onClose}
      title={`Sign up — ${shift.name} · ${target.day}`}
      widthClassName="sm:max-w-md"
    >
      <div className="space-y-3">
        <input
          autoFocus
          className="input"
          placeholder="Search campers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-72 overflow-y-auto rounded-md border border-camp-border divide-y divide-camp-border">
          {candidates.length === 0 && (
            <div className="p-3 text-center text-sm text-zinc-500">No matches.</div>
          )}
          {candidates.map((name) => (
            <button
              key={name}
              onClick={() => sign(name)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-camp-bg flex items-center justify-between"
            >
              <span>{name}</span>
              <Plus size={14} className="text-zinc-500" />
            </button>
          ))}
        </div>
        <div className="border-t border-camp-border pt-3">
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
