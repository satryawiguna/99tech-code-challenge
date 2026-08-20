import type { Result } from "@/domain";
import type { PriceRecord } from "@/domain";
import { priceFeedArraySchema, priceRecordSchema } from "./priceFeedSchema";
import type { PriceFeedError } from "./priceFeedError";

export interface FetchPriceFeedOptions {
  readonly url: string;
  readonly fetchImpl?: typeof fetch;
}

/**
 * Infrastructure adapter: owns HTTP transport and response-shape validation
 * only. Business validity of individual records (positive price, parseable
 * date) is left to Domain normalization — this function's only job is to
 * guarantee every record it hands back has the correct JSON shape.
 *
 * `fetchImpl` is injectable so this stays testable without a real network
 * call or a global fetch mock.
 */
export async function fetchPriceFeed(
  options: FetchPriceFeedOptions,
): Promise<Result<PriceRecord[], PriceFeedError>> {
  const fetchImpl = options.fetchImpl ?? fetch;

  let response: Response;
  try {
    response = await fetchImpl(options.url);
  } catch (cause) {
    return {
      ok: false,
      error: { code: "NetworkError", message: "Failed to reach the price feed.", cause },
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: {
        code: "NetworkError",
        message: `Price feed responded with status ${response.status}.`,
      },
    };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (cause) {
    return {
      ok: false,
      error: {
        code: "InvalidResponseShape",
        message: "Price feed response was not valid JSON.",
        cause,
      },
    };
  }

  const arrayResult = priceFeedArraySchema.safeParse(json);
  if (!arrayResult.success) {
    return {
      ok: false,
      error: { code: "InvalidResponseShape", message: "Price feed response was not an array." },
    };
  }

  const records = arrayResult.data
    .map((item) => priceRecordSchema.safeParse(item))
    .filter((result): result is { success: true; data: PriceRecord } => result.success)
    .map((result) => result.data);

  return { ok: true, value: records };
}
