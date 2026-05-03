import { useMemo, useState } from "react";
import { MapPinned, Search } from "lucide-react";
import type { UseCampData } from "../hooks/useCampData";

export function LayoutPage({ camp }: { camp: UseCampData }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return camp.data.spacing;
    return camp.data.spacing.filter((s) =>
      [s.who, s.size, s.type, s.notes].join(" ").toLowerCase().includes(q),
    );
  }, [camp.data.spacing, query]);

  const totalArea = camp.data.spacing.reduce((acc, s) => {
    const m = s.size.match(/([\d.,]+)\s*[x×]\s*([\d.,]+)/i);
    if (!m) return acc;
    const a = parseFloat(m[1].replace(",", "."));
    const b = parseFloat(m[2].replace(",", "."));
    if (isNaN(a) || isNaN(b)) return acc;
    return acc + a * b;
  }, 0);

  const missingSpacing = camp.data.campers.filter((c) => !c.spacingAdded);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPinned className="text-amber-300" size={22} /> Camp layout
          </h1>
          <p className="text-zinc-400 text-sm">
            {camp.data.spacing.length} structures · ~{totalArea.toFixed(1)} m² total footprint
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

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Who</th>
              <th>Size</th>
              <th>Type</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => (
              <tr key={`${entry.who}-${i}`}>
                <td className="font-medium text-zinc-100">{entry.who}</td>
                <td>
                  <span className="badge-accent">{entry.size || "—"}</span>
                </td>
                <td>
                  <span className="badge-muted">{entry.type || "—"}</span>
                </td>
                <td className="text-zinc-400 text-xs max-w-md">{entry.notes || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-zinc-500">
                  No structures match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {missingSpacing.length > 0 && (
        <section className="card border-yellow-500/40 bg-yellow-500/5">
          <h2 className="font-semibold mb-2 text-yellow-200">
            Campers without spacing logged
          </h2>
          <ul className="text-sm text-zinc-200 grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {missingSpacing.map((c) => (
              <li key={c.id}>• {c.name}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
