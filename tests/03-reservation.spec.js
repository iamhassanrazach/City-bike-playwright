const { test, expect } = require("@playwright/test");

test("invalid email blocks reservation", async ({ page }) => {
  await page.goto("/");

  // Wait for station cards to load asynchronously from the API
  await expect(page.locator(".station-card").first()).toBeVisible();

  // Click reserve on the first station card
  await page
    .getByRole("button", { name: /reserve at/i })
    .first()
    .click();

  // Type an invalid email and attempt confirmation
  await page.getByLabel(/email/i).fill("invalid-email-format");
  await page.getByRole("button", { name: /^confirm reservation$/i }).click();

  // Assert that the email error message is visible and no result is posted
  await expect(page.locator("#email-error")).toBeVisible();
  await expect(page.locator("#result")).toBeEmpty();
});

test("reservation sends correct payload and confirms booking", async ({
  page,
}) => {
  // Intercept the POST request to /api/reservations to mock the backend response
  await page.route("**/api/reservations", async (route) => {
    const postData = route.request().postDataJSON();

    // Assert that the request payload contains the correct station and email
    expect(postData).toEqual({
      stationId: "central",
      email: "student@example.com",
    });

    // Fulfill with a mock HTTP 201 response and reservation ID CB-DEMO-777
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ reservationId: "CB-DEMO-777" }),
    });
  });

  await page.goto("/");

  // Wait for station cards to load asynchronously from the API
  await expect(page.locator(".station-card").first()).toBeVisible();

  // Select the first station, enter a valid email, and confirm
  await page
    .getByRole("button", { name: /reserve at/i })
    .first()
    .click();
  await page.getByLabel(/email/i).fill("student@example.com");
  await page.getByRole("button", { name: /^confirm reservation$/i }).click();

  // Assert that the UI successfully renders the mocked reservation confirmation
  await expect(page.locator("#result")).toContainText("CB-DEMO-777");
});
