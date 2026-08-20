/**
 * Text-input mask only — restricts what the user can type into the amount
 * field (digits, at most one decimal point, no leading zeros). This is not
 * business validation: a malformed/empty/negative result is still handled
 * by Domain's `parseAmount` + InvalidAmount downstream. Purely a UX
 * convenience so the field never displays "1.2.3" as the user types.
 */
export function sanitizeAmountInput(raw: string): string {
  let value = raw.replace(/[^0-9.]/g, "");

  const firstDot = value.indexOf(".");
  if (firstDot > -1) {
    value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
  }

  if (value.startsWith(".")) value = "0" + value;
  if (/^0[0-9]/.test(value)) value = value.replace(/^0+/, "");

  return value;
}
