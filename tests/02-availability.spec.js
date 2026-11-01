const { test, expect } = require("@playwright/test");

// MISSION 2 — Add a Playwright test that first FAILS because of BUG-101.
// Behavior required: enabling "Available bikes only" hides Riverside Park (0 bikes)
// and shows exactly three station cards. Fix public/app.js only AFTER the test fails.

test("BUG-101: available-only filter excludes zero-bike stations", async ({
  page,
}) => {
  await page.goto("/");

  // 1. Assert that all 4 stations load initially (using .station-card)
  const stationCards = page.locator(".station-card");
  await expect(stationCards).toHaveCount(4);

  // 2. Check the "Available bikes only" checkbox by its accessible label
  await page.getByLabel(/available bikes only/i).check();

  // 3. Assert that exactly 3 cards remain and Riverside Park (0 bikes) is absent
  await expect(stationCards).toHaveCount(3);
  await expect(page.getByText("Riverside Park")).not.toBeVisible();
});
