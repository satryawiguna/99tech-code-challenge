import { TokenIcon } from "../atoms/TokenIcon";

export interface AssetSelectorTriggerProps {
  readonly symbol: string | null;
  readonly placeholder: string;
  readonly label: string;
  readonly onClick: () => void;
}

/** FR-004/FR-005: opens the pay/receive asset-selection dialog. */
export function AssetSelectorTrigger({
  symbol,
  placeholder,
  label,
  onClick,
}: AssetSelectorTriggerProps) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={onClick}
      aria-label={label}
      style={{ flex: "none", gap: 8, padding: "6px 10px", borderRadius: 999 }}
    >
      {symbol ? (
        <TokenIcon symbol={symbol} size={24} />
      ) : (
        <span className="token-icon" style={{ width: 24, height: 24 }} />
      )}
      <span>{symbol ?? placeholder}</span>
      <span aria-hidden="true" style={{ opacity: 0.5, fontSize: 11 }}>
        ▾
      </span>
    </button>
  );
}
