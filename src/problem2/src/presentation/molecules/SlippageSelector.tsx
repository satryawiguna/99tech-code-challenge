import type { SlippageTolerance } from "@/domain";

const OPTIONS: ReadonlyArray<{ value: SlippageTolerance; label: string }> = [
  { value: 0.001, label: "0.1%" },
  { value: 0.005, label: "0.5%" },
  { value: 0.01, label: "1%" },
];

export interface SlippageSelectorProps {
  readonly value: SlippageTolerance;
  readonly onChange: (value: SlippageTolerance) => void;
}

/**
 * FR-021: exactly one of 0.1% / 0.5% / 1% is selected at a time.
 *
 * Deliberately not a `<fieldset>/<legend>` pair: `<legend>` is always a
 * block-level box in every browser, so it stacks above its fieldset instead
 * of sitting inline beside it — even inside a flex fieldset. A plain
 * `role="group"` wrapper with a sibling label span keeps the label and the
 * control on the same row (matching the Rate/Minimum received rows above
 * it) while `aria-label` on the radiogroup preserves the accessible name.
 */
export function SlippageSelector({ value, onChange }: SlippageSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Max slippage"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
    >
      <span className="text-muted" style={{ fontSize: 12.5 }}>
        Max slippage
      </span>
      <div className="seg" role="radiogroup" aria-label="Max slippage">
        {OPTIONS.map((option) => (
          <label key={option.value} className="seg-opt">
            <input
              type="radio"
              name="slippage"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
