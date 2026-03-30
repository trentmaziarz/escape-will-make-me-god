import { test, expect } from "@playwright/test";
import { EncryptJWT } from "jose";
import { createHash } from "crypto";

const JWT_SECRET = "test-secret-for-dev";

async function createTestToken(): Promise<string> {
  const secret = createHash("sha256").update(JWT_SECRET).digest();
  return new EncryptJWT({ email: "test@example.com", phone: "+15550001234" })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .encrypt(secret);
}

test.describe("Detonation Flow", () => {
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

    // Progress indicator should be visible
    await expect(page.getByText(/\d+% — Scanning/)).toBeVisible();
  });

  test("review phase: services selectable with detonate button", async ({
    page,
  }) => {
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // Wait for scan to complete and review to appear
    await expect(page.getByText("Target list")).toBeVisible({
      timeout: 30000,
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
    await page.getByText("NONE").click();

    // Detonate should be disabled with no selection
    await expect(detonateBtn).toBeDisabled();

    // Re-select all
    await page.getByText("ALL").click();
    await expect(detonateBtn).toBeEnabled();
  });

  test("detonation phase shows dissolution", async ({ page }) => {
    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // Wait for review
    await expect(page.getByText("Target list")).toBeVisible({
      timeout: 30000,
    });

    // Click detonate
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
      timeout: 30000,
    });

    // Click detonate
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
      timeout: 30000,
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
