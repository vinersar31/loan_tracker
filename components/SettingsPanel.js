"use client";
import { useState } from "react";
import { Settings, X } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const STAT_CARDS = [
  { id: "totalLoan", name: "Original loan" },
  { id: "totalPaid", name: "Total paid" },
  { id: "totalPrincipal", name: "Principal paid" },
  { id: "totalInterest", name: "Interest paid" },
  { id: "totalFees", name: "Fees paid" },
  { id: "remaining", name: "Remaining" },
];

const INDICATORS = [
  { id: "eurRate", name: "EUR / RON" },
  { id: "robor3m", name: "ROBOR 3M" },
  { id: "robor6m", name: "ROBOR 6M" },
  { id: "ircc", name: "IRCC" },
];

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-hi"
    >
      <span className={checked ? "text-main" : "text-secondary"}>{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-surface-hi"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPanel() {
  const { mounted, toggleStatCard, toggleIndicator, isHidden } =
    useUserPreferences();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Customize dashboard"
        aria-label="Settings"
      >
        <Settings size={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="card absolute right-0 z-50 mt-2 w-72 animate-fade-in-up p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-main">
                Customize dashboard
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-secondary transition-colors hover:text-main"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {!mounted ? (
              <p className="py-8 text-center text-sm text-dim">Loading…</p>
            ) : (
              <>
                <div className="mt-4">
                  <p className="stat-label mb-2">Stat cards</p>
                  <div className="space-y-1">
                    {STAT_CARDS.map((c) => (
                      <Toggle
                        key={c.id}
                        label={c.name}
                        checked={!isHidden(c.id, "statCard")}
                        onChange={() => toggleStatCard(c.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="stat-label mb-2">Economic indicators</p>
                  <div className="space-y-1">
                    {INDICATORS.map((c) => (
                      <Toggle
                        key={c.id}
                        label={c.name}
                        checked={!isHidden(c.id, "indicator")}
                        onChange={() => toggleIndicator(c.id)}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-3 border-t border-hairline/10 pt-3 text-xs text-dim">
                  Tip: drag stat cards to reorder them.
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
