import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * architecture.md §33 — minimum flow plus the listed additional critical
 * flows. The challenge price feed is mocked via route interception so runs
 * are deterministic and don't depend on a live third-party endpoint;
 * fixture balances (ETH: 5, USDC: 10,000) come from the app's own static
 * `BALANCE_FIXTURES` (infrastructure/runtime/balanceFixtures.ts).
 */
const PRICES = [
  { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.93 },
  { currency: "USDC", date: "2023-08-29T07:10:52.000Z", price: 1 },
  { currency: "ATOM", date: "2023-08-29T07:10:52.000Z", price: 7.15 },
];

async function mockPriceFeed(page: Page, prices: readonly unknown[] = PRICES) {
  await page.route("**/prices.json", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(prices) }),
  );
}

async function selectAsset(page: Page, side: "pay" | "receive", symbol: string) {
  const label = side === "pay" ? "Choose the asset you pay with" : "Choose the asset you receive";
  await page.getByLabel(label).click();
  await page.waitForSelector("dialog[open]");
  await page
    .getByRole("button", { name: new RegExp(`^${symbol}`) })
    .first()
    .click();
}

test.describe("Nocturne Swap — critical journeys", () => {
  test.beforeEach(async ({ page }) => {
    await mockPriceFeed(page);
  });

  test("minimum flow: load, select assets, enter amount, review, confirm, success", async ({
    page,
  }) => {
    await page.goto("/swap");
    await expect(page.getByText("Swap assets")).toBeVisible();

    await selectAsset(page, "pay", "ETH");
    await selectAsset(page, "receive", "USDC");
    await page.getByLabel("Amount to pay").fill("1");

    const dialog = page.locator('dialog[aria-label="Confirm swap"]');
    await page.getByRole("button", { name: "Review swap" }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Slippage")).toBeVisible();
    await expect(dialog.getByText(/price impact/i)).toHaveCount(0);
    await expect(dialog.getByText(/network fee/i)).toHaveCount(0);

    await page.getByRole("button", { name: "Confirm swap" }).click();
    await expect(page.getByText("Swap complete")).toBeVisible();
    await expect(dialog.getByText(/Simulated transaction/)).toBeVisible();
    await expect(dialog.getByText(/^SIM-/)).toBeVisible();
    await expect(dialog.getByText(/0x[a-fA-F0-9]{10,}/)).toHaveCount(0);
  });

  test("HALF sets the amount to half the source balance", async ({ page }) => {
    await page.goto("/swap");
    await selectAsset(page, "pay", "ETH");
    await selectAsset(page, "receive", "USDC");

    await page.getByRole("button", { name: "HALF" }).click();

    await expect(page.getByLabel("Amount to pay")).toHaveValue("2.5");
  });

  test("MAX sets the amount to the full source balance", async ({ page }) => {
    await page.goto("/swap");
    await selectAsset(page, "pay", "ETH");
    await selectAsset(page, "receive", "USDC");

    await page.getByRole("button", { name: "MAX" }).click();

    await expect(page.getByLabel("Amount to pay")).toHaveValue("5");
  });

  test("reverse swap flips the pay/receive assets", async ({ page }) => {
    await page.goto("/swap");
    await selectAsset(page, "pay", "ETH");
    await selectAsset(page, "receive", "USDC");
    await page.getByLabel("Amount to pay").fill("1");

    await page.getByRole("button", { name: "Reverse the swap direction" }).click();

    await expect(page.getByRole("button", { name: "Choose the asset you pay with" })).toHaveText(
      /USDC/,
    );
    await expect(page.getByRole("button", { name: "Choose the asset you receive" })).toHaveText(
      /ETH/,
    );
  });

  test("changing slippage recalculates minimum received", async ({ page }) => {
    await page.goto("/swap");
    await selectAsset(page, "pay", "ETH");
    await selectAsset(page, "receive", "USDC");
    await page.getByLabel("Amount to pay").fill("1");
    const minimumReceivedRow = page.getByText("Minimum received").locator("..");
    const before = await minimumReceivedRow.textContent();

    // The radio input itself is zero-sized/visually hidden for custom
    // styling (.seg-opt input: position absolute, 0×0, pointer-events
    // none) — click the wrapping visible <label>, exactly what a real
    // user's pointer would land on.
    await page.locator(".seg-opt", { hasText: /^1%$/ }).click();

    await expect(minimumReceivedRow).not.toHaveText(before ?? "");
  });

  test("an invalid (zero) amount blocks review with guidance, not a silent failure", async ({
    page,
  }) => {
    await page.goto("/swap");
    await selectAsset(page, "pay", "ETH");
    await selectAsset(page, "receive", "USDC");

    await page.getByLabel("Amount to pay").fill("0");

    await expect(page.locator(".notice span:last-child")).toHaveText(
      "Enter a valid amount greater than zero.",
    );
    await expect(page.getByRole("button", { name: "Review swap" })).toHaveCount(0);
  });

  test("an amount exceeding balance blocks review as insufficient balance", async ({ page }) => {
    await page.goto("/swap");
    await selectAsset(page, "pay", "ETH");
    await selectAsset(page, "receive", "USDC");

    await page.getByLabel("Amount to pay").fill("999999");

    await expect(page.locator(".notice span:last-child")).toContainText("Insufficient ETH balance");
    await expect(page.getByRole("button", { name: /Insufficient ETH balance/ })).toBeDisabled();
  });

  test("selecting the same asset for both sides surfaces a validation error", async ({ page }) => {
    await page.goto("/swap");
    await selectAsset(page, "pay", "ETH");
    await selectAsset(page, "receive", "ETH");

    // The pay side must not be silently cleared by the "swap sides" shortcut
    // when receive had no prior asset — this should be a genuine same-asset
    // validation state instead.
    await expect(page.getByRole("button", { name: "Choose the asset you pay with" })).toHaveText(
      /ETH/,
    );
    await expect(page.locator(".notice span:last-child")).toHaveText(
      "Choose two different assets to swap.",
    );
  });

  test("manual refresh reloads price data and keeps the non-live wording", async ({ page }) => {
    await page.goto("/swap");
    await expect(page.getByText(/Provided price data/)).toBeVisible();

    await page.getByRole("button", { name: /Refresh/ }).click();

    await expect(page.getByRole("button", { name: /Refresh/ })).toBeEnabled();
    await expect(page.getByText(/Provided price data/)).toBeVisible();
    await expect(page.getByText(/live/i)).toHaveCount(0);
  });

  test("a refresh failure keeps the last known valid data usable", async ({ page }) => {
    await page.goto("/swap");
    await expect(page.getByText("Swap assets")).toBeVisible();

    await page.unroute("**/prices.json");
    await page.route("**/prices.json", (route) => route.fulfill({ status: 500, body: "error" }));

    await page.getByRole("button", { name: /Refresh/ }).click();

    await expect(page.getByText(/Refresh failed.*last known/i)).toBeVisible();
    await expect(page.getByText("Swap assets")).toBeVisible();
  });
});

test.describe("Nocturne Swap — price feed failure", () => {
  test("initial price load failure shows a retry that recovers", async ({ page }) => {
    let fail = true;
    await page.route("**/prices.json", (route) => {
      if (fail) return route.fulfill({ status: 500, body: "error" });
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(PRICES),
      });
    });

    await page.goto("/swap");
    await expect(page.getByText(/Unable to load market prices/)).toBeVisible();

    fail = false;
    await page.getByRole("button", { name: "Retry" }).click();

    await expect(page.getByText("Swap assets")).toBeVisible();
  });
});
