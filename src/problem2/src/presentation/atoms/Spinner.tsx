export interface SpinnerProps {
  readonly size?: number;
  readonly label?: string;
}

export function Spinner({ size = 20, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className="spinner"
      style={{ width: size, height: size }}
    />
  );
}
