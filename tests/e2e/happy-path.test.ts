import { test, expect } from "@playwright/test";
import { EncryptJWT } from "jose";
import { createHash } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-for-dev";

async function createTestToken(
  email = "test@example.com",
  phone = "+15550001234"
): Promise<string> {
  const secret = createHash("sha256").update(JWT_SECRET).digest();
  return new EncryptJWT({ email, phone })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .encrypt(secret);
}

// Mock scan response — realistic service list with mixed deletion methods
const MOCK_SCAN_RESPONSE = {
  services: [
    { serviceId: "facebook", confidence: 0.9, source: "hibp", name: "Facebook", icon: "FB", category: "social-media", deletionDifficulty: "hard", deletionMethod: "manual-guide" },
    { serviceId: "linkedin", confidence: 0.9, source: "hibp", name: "LinkedIn", icon: "LI", category: "social-media", deletionDifficulty: "medium", deletionMethod: "manual-guide" },
    { serviceId: "spokeo", confidence: 0.2, source: "database", name: "Spokeo", icon: "SP", category: "data-broker", deletionDifficulty: "easy", deletionMethod: "auto-email" },
    { serviceId: "whitepages", confidence: 0.2, source: "database", name: "Whitepages", icon: "WP", category: "data-broker", deletionDifficulty: "easy", deletionMethod: "auto-email" },
    { serviceId: "beenverified", confidence: 0.2, source: "database", name: "BeenVerified", icon: "BV", category: "data-broker", deletionDifficulty: "easy", deletionMethod: "auto-email" },
  ],
  scannedAt: new Date().toISOString(),
  maskedEmail: "te***@example.com",
};

const MOCK_DETONATE_RESPONSE = {
  success: true,
  requestsSent: 3,
  guidesGenerated: 2,
  reportEmailed: true,
};

test.describe("Happy Path — Complete Detonation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock /api/initiate — bypasses server-side Turnstile + Resend
    await page.route("**/api/initiate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Check your email" }),
      });
    });

    // Mock /api/scan — bypasses HIBP + database scanner (server-side only)
    await page.route("**/api/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SCAN_RESPONSE),
      });
    });

    // Mock /api/detonate — bypasses Resend email sends + PDF generation
    await page.route("**/api/detonate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_DETONATE_RESPONSE),
      });
    });

  });

  test("complete detonation flow", async ({ page }) => {
    // Manifesto animation (~19s) + scan reveal (~10s) + dissolution (~15s)
    test.setTimeout(180_000);

    // --- a. Navigate to / ---
    await page.goto("/");
    await expect(page).toHaveTitle(/DEINDEX/i);

    // --- b. Wait for manifesto animation to complete, form to appear ---
    const emailInput = page.locator("#email");
    await expect(emailInput).toBeVisible({ timeout: 30_000 });

    // Manifesto text should have rendered
    await expect(page.getByText("Stop counting.")).toBeVisible();

    // --- c. Enter email address ---
    await emailInput.fill("test@example.com");

    // --- d. Submit form (Turnstile uses Cloudflare test key — auto-passes) ---
    const submitBtn = page.getByRole("button", {
      name: "Begin your disappearance",
    });
    await expect(submitBtn).toBeEnabled({ timeout: 15_000 });
    await submitBtn.click();

    // --- e. Verify "check your email" confirmation appears ---
    await expect(page.getByText("Check your email.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("test@example.com")).toBeVisible();
    await expect(
      page.getByText("The link expires in 1 hour.")
    ).toBeVisible();

    // --- f. Navigate directly to /detonate?token={test-token} ---
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // --- g. Wait for scan to complete ---
    await expect(page.getByRole("heading", { name: "Scanning" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Facebook")).toBeVisible({ timeout: 15_000 });

    // --- h. Verify services appear in review phase ---
    await expect(page.getByText("Target list")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("Facebook")).toBeVisible();
    await expect(page.getByText("Spokeo")).toBeVisible();
    await expect(
      page.getByText(/\d+ services? selected for deletion/)
    ).toBeVisible();

    // Difficulty tags present (hard → MANUAL, easy → GUIDED)
    await expect(page.getByText("MANUAL").first()).toBeVisible();
    await expect(page.getByText("GUIDED").first()).toBeVisible();

    // ALL / NONE selection buttons
    await expect(page.getByText("ALL")).toBeVisible();
    await expect(page.getByText("NONE")).toBeVisible();

    // Irreversibility warning
    await expect(
      page.getByText("THIS ACTION IS IRREVERSIBLE")
    ).toBeVisible();

    // --- i. Select all services and click DETONATE ---
    await page.getByRole("button", { name: "Select all services", exact: true }).click();
    const detonateBtn = page.getByRole("button", { name: "Detonate" });
    await expect(detonateBtn).toBeEnabled();
    await detonateBtn.click();

    // --- j. Wait for detonation sequence to finish ---
    await expect(page.getByText("Detonation in progress")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText("SENT").first()).toBeVisible({
      timeout: 15_000,
    });

    // --- k. Verify completion screen ---
    await expect(page.getByText("You are disappearing.")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText("te***@example.com")).toBeVisible();
    await expect(
      page.getByText(/we have already forgotten you/i)
    ).toBeVisible();
    await expect(page.getByText(/support the cause/i)).toBeVisible();
  });

  test("mobile flow (iPhone 13 viewport)", async ({ page }) => {
    test.setTimeout(180_000);

    // iPhone 13 viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // --- Landing page ---
    await page.goto("/");
    await expect(page).toHaveTitle(/DEINDEX/i);

    // Wait for form
    const emailInput = page.locator("#email");
    await expect(emailInput).toBeVisible({ timeout: 30_000 });

    // No horizontal overflow on landing
    const landingWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(landingWidth).toBeLessThanOrEqual(390);

    // Fill and submit (wait for Turnstile test key to auto-pass)
    await emailInput.fill("test@example.com");
    const submitBtn = page.getByRole("button", { name: "Begin your disappearance" });
    await expect(submitBtn).toBeEnabled({ timeout: 15_000 });
    await submitBtn.click();
    await expect(page.getByText("Check your email.")).toBeVisible({
      timeout: 10_000,
    });

    // --- Detonation flow ---
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // Wait for review phase
    await expect(page.getByText("Target list")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("Facebook")).toBeVisible();

    // Verify mobile layout — no horizontal overflow
    const reviewWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(reviewWidth).toBeLessThanOrEqual(390);

    // Select all services and detonate
    await page.getByRole("button", { name: "Select all services", exact: true }).click();
    const detonateBtn = page.getByRole("button", { name: "Detonate" });
    await expect(detonateBtn).toBeEnabled();
    await detonateBtn.click();

    // Wait for completion
    await expect(page.getByText("You are disappearing.")).toBeVisible({
      timeout: 60_000,
    });

    // No horizontal overflow on completion
    const completeWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(completeWidth).toBeLessThanOrEqual(390);
  });
});
