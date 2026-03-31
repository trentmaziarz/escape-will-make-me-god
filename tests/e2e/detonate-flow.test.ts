import { test, expect } from "@playwright/test";
import { EncryptJWT } from "jose";
import { createHash } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-for-dev";

async function createTestToken(): Promise<string> {
  const secret = createHash("sha256").update(JWT_SECRET).digest();
  return new EncryptJWT({ email: "test@example.com", phone: "+15550001234" })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .encrypt(secret);
}

const MOCK_SCAN_RESPONSE = {
  services: [
    { serviceId: "facebook", confidence: 0.9, source: "hibp", name: "Facebook", icon: "FB", category: "social-media", deletionDifficulty: "hard", deletionMethod: "manual-guide" },
    { serviceId: "linkedin", confidence: 0.9, source: "hibp", name: "LinkedIn", icon: "LI", category: "social-media", deletionDifficulty: "auto", deletionMethod: "auto-api" },
    { serviceId: "spokeo", confidence: 0.2, source: "database", name: "Spokeo", icon: "SP", category: "data-broker", deletionDifficulty: "easy", deletionMethod: "auto-email" },
    { serviceId: "whitepages", confidence: 0.2, source: "database", name: "Whitepages", icon: "WP", category: "data-broker", deletionDifficulty: "medium", deletionMethod: "auto-email" },
  ],
  scannedAt: new Date().toISOString(),
  maskedEmail: "te***@example.com",
};

const MOCK_DETONATE_RESPONSE = {
  success: true,
  requestsSent: 3,
  guidesGenerated: 1,
  reportEmailed: true,
};

test.describe("Detonation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock /api/scan — deterministic results without real HIBP
    await page.route("**/api/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SCAN_RESPONSE),
      });
    });

    // Mock /api/detonate — bypasses Resend + PDF generation
    await page.route("**/api/detonate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_DETONATE_RESPONSE),
      });
    });
  });

  test("shows invalid link without token", async ({ page }) => {
    await page.goto("/detonate");
    await expect(page.getByText("Invalid Link")).toBeVisible();
  });

  test("scan phase: services appear progressively", async ({ page }) => {
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // Should start scanning
    await expect(page.getByText("Scanning")).toBeVisible({ timeout: 10000 });

    // Services should appear one by one
    await expect(page.getByText("Facebook")).toBeVisible({ timeout: 15000 });

    // Progress indicator should be visible (format: "email — X% complete")
    await expect(page.getByText(/\d+% complete/)).toBeVisible();
  });

  test("review phase: services selectable with detonate button", async ({
    page,
  }) => {
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // Wait for scan to complete and review to appear
    await expect(page.getByText("Target list")).toBeVisible({
      timeout: 45000,
    });

    // Services should be listed
    await expect(page.getByText("Facebook")).toBeVisible();
    await expect(page.getByText("Spokeo")).toBeVisible();

    // Difficulty tags should be present
    await expect(page.getByText("AUTO").first()).toBeVisible();
    await expect(page.getByText("MANUAL").first()).toBeVisible();

    // Detonate button should be visible and enabled
    const detonateBtn = page.getByRole("button", { name: "Detonate" });
    await expect(detonateBtn).toBeVisible();
    await expect(detonateBtn).toBeEnabled();

    // Irreversibility warning
    await expect(
      page.getByText("THIS ACTION IS IRREVERSIBLE")
    ).toBeVisible();

    // Click a service to deselect it
    await page.getByText("Facebook").click();

    // ALL / NONE buttons
    await expect(page.getByText("NONE")).toBeVisible();
    await page.getByRole("button", { name: "Deselect all services" }).click();

    // Detonate should be disabled with no selection
    await expect(detonateBtn).toBeDisabled();

    // Re-select all
    await page.getByRole("button", { name: "Select all services", exact: true }).click();
    await expect(detonateBtn).toBeEnabled();
  });

  test("detonation phase shows dissolution", async ({ page }) => {
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // Wait for review
    await expect(page.getByText("Target list")).toBeVisible({
      timeout: 45000,
    });

    // Select all services then detonate
    await page.getByRole("button", { name: "Select all services", exact: true }).click();
    await page.getByRole("button", { name: "Detonate" }).click();

    // Detonation phase
    await expect(page.getByText("Detonation in progress")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("PENDING").first()).toBeVisible();

    // Services should start showing SENT status
    await expect(page.getByText("SENT").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("complete phase shows disappearing message", async ({ page }) => {
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // Wait for review
    await expect(page.getByText("Target list")).toBeVisible({
      timeout: 45000,
    });

    // Select all services then detonate
    await page.getByRole("button", { name: "Select all services", exact: true }).click();
    await page.getByRole("button", { name: "Detonate" }).click();

    // Wait for completion (dissolution + API + 1s pause)
    await expect(page.getByText("You are disappearing.")).toBeVisible({
      timeout: 60000,
    });
    await expect(page.getByText("te***@example.com")).toBeVisible();
    await expect(
      page.getByText(/we have already forgotten you/i)
    ).toBeVisible();

    // Donation link
    await expect(page.getByText(/support the cause/i)).toBeVisible();
  });

  test("responsive at 375px width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // Should scan and show review
    await expect(page.getByText("Target list")).toBeVisible({
      timeout: 45000,
    });

    // Services should be visible without horizontal scroll
    await expect(page.getByText("Facebook")).toBeVisible();
    const detonateBtn = page.getByRole("button", { name: "Detonate" });
    await expect(detonateBtn).toBeVisible();

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test("mute toggle present on detonate page", async ({ page }) => {
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // MuteToggle is in the root layout, should be visible on all pages
    const muteBtn = page.getByRole("button", { name: /mute|unmute/i });
    await expect(muteBtn).toBeVisible({ timeout: 5000 });
  });
});
