import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daily Purchase — Bakery Purchase Log" },
      {
        name: "description",
        content:
          "Log your bakery's daily purchases by item, quantity and unit, then share the list instantly on WhatsApp or SMS.",
      },
      { property: "og:title", content: "Daily Purchase — Bakery Purchase Log" },
      {
        property: "og:description",
        content:
          "Log your bakery's daily purchases by item, quantity and unit, then share the list on WhatsApp or SMS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DailyPurchase,
});

const ITEMS = ["Milk", "Banana", "Apple", "Pineapple", "Mava", "Kiwi"];
const UNITS = ["Gms", "Kg", "Pcs", "Ml"];
const OTHER = "__other__";

type Row = { id: number; item: string; qty: string; unit: string };

const today = () => new Date().toLocaleDateString("en-CA");

function DailyPurchase() {
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<Row[]>([]);

  const [item, setItem] = useState<string>(ITEMS[0]!);
  const [customItem, setCustomItem] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState<string>(UNITS[0]!);
  const [customUnit, setCustomUnit] = useState("");

  const resolvedItem = (item === OTHER ? customItem : item).trim().slice(0, 60);
  const resolvedUnit = (unit === OTHER ? customUnit : unit).trim().slice(0, 20);
  const canAdd = resolvedItem !== "" && qty.trim() !== "" && Number(qty) > 0 && resolvedUnit !== "";

  const addRow = () => {
    if (!canAdd) return;
    setRows((r) => [
      ...r,
      { id: Date.now(), item: resolvedItem, qty: String(Number(qty)), unit: resolvedUnit },
    ]);
    setQty("");
    setCustomItem("");
    setItem(ITEMS[0]!);
  };

  const message =
    `Daily Purchase — ${date}\n` +
    (rows.length
      ? rows.map((r, i) => `${i + 1}. ${r.item} — ${r.qty} ${r.unit}`).join("\n")
      : "No items added.");

  const share = (kind: "wa" | "sms") => {
    const text = encodeURIComponent(message);
    window.location.href =
      kind === "wa" ? `https://wa.me/?text=${text}` : `sms:?&body=${text}`;
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-5 pb-16 pt-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Bakery</p>
        <h1 className="mt-1 text-4xl font-semibold leading-tight">Daily Purchase</h1>
      </header>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field mt-1.5"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-muted-foreground">Item</span>
          <select
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="field mt-1.5"
          >
            {ITEMS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
            <option value={OTHER}>Type your own…</option>
          </select>
        </label>
        {item === OTHER && (
          <input
            autoFocus
            maxLength={60}
            placeholder="Item name"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            className="field mt-2"
          />
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Qty</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="field mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Unit</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="field mt-1.5"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value={OTHER}>Type your own…</option>
            </select>
          </label>
        </div>
        {unit === OTHER && (
          <input
            maxLength={20}
            placeholder="Unit name"
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
            className="field mt-2"
          />
        )}

        <button
          onClick={addRow}
          disabled={!canAdd}
          className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Add to list
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Today's list</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing added yet — add your first purchase above.
          </p>
        ) : (
          <ul className="mt-3 divide-y rounded-2xl border bg-card">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1 font-medium">{r.item}</span>
                <span className="text-muted-foreground">
                  {r.qty} {r.unit}
                </span>
                <button
                  onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                  aria-label={`Remove ${r.item}`}
                  className="rounded-md px-2 py-1 text-sm text-destructive"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Share via</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => share("wa")}
            disabled={rows.length === 0}
            className="rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground disabled:opacity-40"
          >
            WhatsApp
          </button>
          <button
            onClick={() => share("sms")}
            disabled={rows.length === 0}
            className="rounded-xl border border-primary px-4 py-3 font-semibold text-primary disabled:opacity-40"
          >
            SMS
          </button>
        </div>
        {rows.length > 0 && (
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            {message}
          </pre>
        )}
      </section>
    </main>
  );
}
