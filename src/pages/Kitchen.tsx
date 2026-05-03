import { useMemo, useState } from "react";
import { Check, Search, UtensilsCrossed } from "lucide-react";
import type { UseCampData } from "../hooks/useCampData";

export function KitchenPage({ camp }: { camp: UseCampData }) {
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const list = camp.data.kitchen;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .map((item, idx) => ({ ...item, idx }))
      .filter((it) => (onlyOpen ? !it.confirmed : true))
      .filter((it) =>
        q ? [it.item, it.size, it.provider, it.bringer, it.notes].join(" ").toLowerCase().includes(q) : true,
      );
  }, [list, query, onlyOpen]);

  const confirmedCount = list.filter((k) => k.confirmed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="text-amber-300" size={22} /> Kitchen inventory
          </h1>
          <p className="text-zinc-400 text-sm">
            {confirmedCount} of {list.length} confirmed brought
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
            />
            Only unconfirmed
          </label>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              className="input pl-9"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Provider</th>
              <th>Bringer</th>
              <th>Notes</th>
              <th>Confirmed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.idx}>
                <td className="font-medium text-zinc-100">{it.item}</td>
                <td className="text-zinc-300 text-xs">{it.size || "—"}</td>
                <td className="text-zinc-300">{it.provider || "—"}</td>
                <td>
                  <input
                    className="input text-xs px-2 py-1"
                    value={it.bringer}
                    placeholder="who's bringing it"
                    onChange={(e) => camp.updateKitchenItem(it.idx, { bringer: e.target.value })}
                  />
                </td>
                <td className="text-zinc-400 text-xs max-w-sm">{it.notes || "—"}</td>
                <td>
                  <button
                    onClick={() => camp.updateKitchenItem(it.idx, { confirmed: !it.confirmed })}
                    className={
                      it.confirmed
                        ? "badge-success"
                        : "badge-muted hover:bg-camp-bg cursor-pointer"
                    }
                  >
                    {it.confirmed ? (
                      <>
                        <Check size={11} /> brought
                      </>
                    ) : (
                      "mark brought"
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-zinc-500">
                  Nothing matches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
