const { test, expect } = require("@playwright/test");

test("station API outage shows an error and retry restores results", async ({
  page,
}) => {
  let attempts = 0;

  // Intercept the GET /api/stations request
  await page.route("**/api/stations", async (route) => {
    attempts++;
    if (attempts === 1) {
      // First attempt: simulate server outage with HTTP 503
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Service Unavailable" }),
      });
    } else {
      // Subsequent attempts (retry): allow the real request to proceed
      await route.continue();
    }
  });

  await page.goto("/");

  // 1. Assert that the error notification and "Retry loading" button appear
  await expect(page.locator("#notification")).toContainText(
    "Unable to load stations.",
  );
  const retryButton = page.getByRole("button", { name: /retry loading/i });
  await expect(retryButton).toBeVisible();

  // 2. Click retry to trigger the second (successful) attempt
  await retryButton.click();

  // 3. Assert that station cards load successfully and the error alert is dismissed (.station-card)
  const stationCards = page.locator(".station-card");
  await expect(stationCards.first()).toBeVisible();
  await expect(page.locator("#notification")).toBeHidden();
});
