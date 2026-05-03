import { useMemo, useState } from "react";
import { Check, Edit3, Mail, Phone, Search, X } from "lucide-react";
import { dayLabels } from "../data/seed-data";
import type { Camper } from "../data/types";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../hooks/useToast";
import { useIdentity } from "../hooks/useIdentity";
import type { UseCampData } from "../hooks/useCampData";
import { cn } from "../lib/cn";

type SortKey = "name" | "membership" | "campFeePaid" | "transport" | "dietary";

export function CampersPage({ camp }: { camp: UseCampData }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [activeId, setActiveId] = useState<number | null>(null);
  const { me } = useIdentity();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = camp.data.campers;
    if (q) {
      out = out.filter((c) =>
        [c.name, c.email, c.phone, c.dietary, c.allergies, c.transport]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    out = [...out].sort((a, b) => {
      const av = String(a[sort.key] ?? "");
      const bv = String(b[sort.key] ?? "");
      const cmp = av.localeCompare(bv, undefined, { sensitivity: "base" });
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [camp.data.campers, query, sort]);

  const active = activeId != null ? camp.data.campers.find((c) => c.id === activeId) : null;

  const flipSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Campers</h1>
          <p className="text-zinc-400 text-sm">
            {filtered.length} of {camp.data.campers.length} campers
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, dietary…"
            className="input pl-9"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader label="Name" k="name" sort={sort} onSort={flipSort} />
              <SortHeader label="Member" k="membership" sort={sort} onSort={flipSort} />
              <SortHeader label="Paid" k="campFeePaid" sort={sort} onSort={flipSort} />
              <th>Contact</th>
              <SortHeader label="Dietary" k="dietary" sort={sort} onSort={flipSort} />
              <th>Allergies</th>
              <SortHeader label="Transport" k="transport" sort={sort} onSort={flipSort} />
              <th>Attendance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const isMe = me?.id === c.id;
              return (
                <tr key={c.id} className={isMe ? "bg-camp-accent/10" : undefined}>
                  <td className={cn("font-medium", isMe ? "text-amber-300" : "text-zinc-100")}>
                    {c.name} {isMe && <span className="text-[10px] text-amber-400/80">(you)</span>}
                  </td>
                  <td>
                    <BoolPill ok={c.membership} okLabel="yes" badLabel="no" />
                  </td>
                  <td>
                    <BoolPill ok={c.campFeePaid} okLabel="paid" badLabel="open" />
                  </td>
                  <td>
                    <div className="text-xs text-zinc-300 space-y-0.5 max-w-[180px]">
                      {c.email && (
                        <div className="flex items-center gap-1 truncate">
                          <Mail size={11} className="text-zinc-500" /> {c.email}
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1 truncate">
                          <Phone size={11} className="text-zinc-500" /> {c.phone}
                        </div>
                      )}
                      {!c.email && !c.phone && <span className="text-zinc-600">—</span>}
                    </div>
                  </td>
                  <td>{c.dietary || <span className="text-zinc-600">—</span>}</td>
                  <td>
                    {c.allergies ? (
                      <span className="badge-warn">{c.allergies}</span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td>
                    <div className="text-xs text-zinc-300 max-w-[160px] truncate" title={c.transport}>
                      {c.transport || <span className="text-zinc-600">—</span>}
                    </div>
                  </td>
                  <td>
                    <AttendanceStrip camper={c} />
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setActiveId(c.id)}
                      className="btn-ghost p-1.5"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-zinc-500">
                  No campers match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CamperDetailModal
        camper={active ?? null}
        camp={camp}
        onClose={() => setActiveId(null)}
      />
    </div>
  );
}

function SortHeader({
  label,
  k,
  sort,
  onSort,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (k: SortKey) => void;
}) {
  const active = sort.key === k;
  return (
    <th>
      <button
        onClick={() => onSort(k)}
        className={cn(
          "flex items-center gap-1 hover:text-zinc-100",
          active && "text-amber-300",
        )}
      >
        {label}
        {active && <span className="text-[10px]">{sort.dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}

function BoolPill({ ok, okLabel, badLabel }: { ok: boolean; okLabel: string; badLabel: string }) {
  return ok ? (
    <span className="badge-success">
      <Check size={11} /> {okLabel}
    </span>
  ) : (
    <span className="badge-muted">
      <X size={11} /> {badLabel}
    </span>
  );
}

function AttendanceStrip({ camper }: { camper: Camper }) {
  return (
    <div className="flex gap-0.5">
      {dayLabels.map((d) => {
        const status = camper.attendance[d.key];
        let bg = "bg-zinc-700/40";
        let glyph = " ";
        if (status === "confirmed") {
          bg = "bg-camp-accent";
          glyph = "X";
        } else if (status === "maybe") {
          bg = "bg-yellow-500/40";
          glyph = "?";
        }
        return (
          <span
            key={d.key}
            title={`${d.label}: ${status}`}
            className={cn(
              "w-4 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold text-black/80",
              bg,
            )}
          >
            {glyph}
          </span>
        );
      })}
    </div>
  );
}

function CamperDetailModal({
  camper,
  camp,
  onClose,
}: {
  camper: Camper | null;
  camp: UseCampData;
  onClose: () => void;
}) {
  const toast = useToast();
  if (!camper) return null;

  return (
    <Modal open onClose={onClose} title={camper.name} widthClassName="sm:max-w-3xl">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Email">
            <input
              className="input"
              value={camper.email}
              onChange={(e) => camp.updateCamper(camper.id, { email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              className="input"
              value={camper.phone}
              onChange={(e) => camp.updateCamper(camper.id, { phone: e.target.value })}
            />
          </Field>
          <Field label="Dietary">
            <input
              className="input"
              value={camper.dietary}
              onChange={(e) => camp.updateCamper(camper.id, { dietary: e.target.value })}
            />
          </Field>
          <Field label="Allergies">
            <input
              className="input"
              value={camper.allergies}
              onChange={(e) => camp.updateCamper(camper.id, { allergies: e.target.value })}
            />
          </Field>
          <Field label="Transport">
            <input
              className="input"
              value={camper.transport}
              onChange={(e) => camp.updateCamper(camper.id, { transport: e.target.value })}
            />
          </Field>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={camper.membership}
                onChange={(e) => camp.updateCamper(camper.id, { membership: e.target.checked })}
              />
              Membership
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={camper.campFeePaid}
                onChange={(e) => camp.updateCamper(camper.id, { campFeePaid: e.target.checked })}
              />
              Fee paid
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={camper.spacingAdded}
                onChange={(e) => camp.updateCamper(camper.id, { spacingAdded: e.target.checked })}
              />
              Spacing logged
            </label>
          </div>
        </div>

        <div>
          <div className="label mb-2">Attendance</div>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
          >
            {dayLabels.map((d) => {
              const status = camper.attendance[d.key] ?? "no";
              return (
                <div key={d.key} className="flex flex-col items-center gap-1">
                  <div className="text-[10px] text-zinc-500 text-center">{d.label}</div>
                  <select
                    value={status}
                    onChange={(e) => {
                      const next = e.target.value as "confirmed" | "maybe" | "no";
                      camp.setAttendance(camper.id, d.key, next);
                    }}
                    className="bg-camp-bg border border-camp-border rounded text-xs px-1 py-1 w-full"
                  >
                    <option value="confirmed">X</option>
                    <option value="maybe">?</option>
                    <option value="no">·</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => {
              toast.push("Saved automatically");
              onClose();
            }}
            className="btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="label mb-1">{label}</div>
      {children}
    </label>
  );
}
