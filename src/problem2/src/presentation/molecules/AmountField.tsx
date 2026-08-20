import { sanitizeAmountInput } from "@/shared/utils";

export interface AmountFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly "aria-label": string;
  readonly "aria-describedby"?: string;
  readonly "aria-invalid"?: boolean;
}

/** FR-007: text-input masking only (sanitizeAmountInput); business validity is Domain's job downstream. */
export function AmountField(props: AmountFieldProps) {
  return (
    <input
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      placeholder="0.0"
      className="amount-input"
      value={props.value}
      onChange={(event) => props.onChange(sanitizeAmountInput(event.target.value))}
      aria-label={props["aria-label"]}
      aria-describedby={props["aria-describedby"]}
      aria-invalid={props["aria-invalid"]}
    />
  );
}
