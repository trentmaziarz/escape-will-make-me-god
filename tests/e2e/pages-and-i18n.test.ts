import { test, expect } from "@playwright/test";
import { EncryptJWT } from "jose";
import { createHash } from "crypto";

const JWT_SECRET = "test-secret-for-dev";

async function createTestToken(
  overrides: { email?: string; phone?: string; exp?: string } = {}
): Promise<string> {
  const secret = createHash("sha256").update(JWT_SECRET).digest();
  return new EncryptJWT({
    email: overrides.email ?? "test@example.com",
    phone: overrides.phone ?? "+15550001234",
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(overrides.exp ?? "1h")
    .encrypt(secret);
}

async function createExpiredToken(): Promise<string> {
  const secret = createHash("sha256").update(JWT_SECRET).digest();
  // Set issuedAt to 2 hours ago, expiration to 1 hour ago
  const twoHoursAgo = Math.floor(Date.now() / 1000) - 7200;
  return new EncryptJWT({
    email: "test@example.com",
    phone: "+15550001234",
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt(twoHoursAgo)
    .setExpirationTime(twoHoursAgo + 3600) // 1 hour after issuedAt = still 1 hour ago
    .encrypt(secret);
}

// ---------------------------------------------------------------------------
// /database page
// ---------------------------------------------------------------------------
test.describe("/database page", () => {
  test("renders service directory with search", async ({ page }) => {
    await page.goto("/database");

    // Title visible
    await expect(page.getByText("The Open Directory")).toBeVisible({
      timeout: 10_000,
    });

    // Search input exists
    const searchInput = page.getByLabel("Search services");
    await expect(searchInput).toBeVisible();

    // Services are listed — at least one category section renders
    await expect(page.locator('[role="list"]').first()).toBeVisible();

    // "services indexed" count text renders
    await expect(page.getByText(/\d+ services indexed/)).toBeVisible();
  });

  test("search filters services", async ({ page }) => {
    await page.goto("/database");
    await expect(page.getByText("The Open Directory")).toBeVisible({
      timeout: 10_000,
    });

    const searchInput = page.getByLabel("Search services");

    // Type a query that should match known services (e.g., "facebook")
    await searchInput.fill("facebook");

    // Wait for filtering — results count should update
    await expect(page.getByText(/\d+ services? found/)).toBeVisible();

    // Facebook should still be visible
    await expect(page.getByText("Facebook").first()).toBeVisible();

    // Clear search and type a nonsense query
    await searchInput.fill("xyznonexistent12345");
    await expect(page.getByText("No services match your search.")).toBeVisible();
  });

  test("category filter tabs work", async ({ page }) => {
    await page.goto("/database");
    await expect(page.getByText("The Open Directory")).toBeVisible({
      timeout: 10_000,
    });

    // Category tabs should be visible
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    // "ALL" tab should be selected by default
    const allTab = tablist.getByRole("tab", { name: /ALL/i });
    await expect(allTab).toHaveAttribute("aria-selected", "true");

    // Click a specific category tab (e.g., DATA BROKERS if present)
    const tabs = tablist.getByRole("tab");
    const tabCount = await tabs.count();
    if (tabCount > 1) {
      // Click second tab (first non-ALL tab)
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(allTab).toHaveAttribute("aria-selected", "false");
    }
  });
});

// ---------------------------------------------------------------------------
// /donate page
// ---------------------------------------------------------------------------
test.describe("/donate page", () => {
  test("renders donation form with amount options", async ({ page }) => {
    await page.goto("/donate");

    // Title
    await expect(page.getByText("Support the Cause")).toBeVisible({
      timeout: 10_000,
    });

    // Suggested amount buttons
    await expect(page.getByRole("button", { name: "$5" })).toBeVisible();
    await expect(page.getByRole("button", { name: "$10" })).toBeVisible();
    await expect(page.getByRole("button", { name: "$25" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Custom" })).toBeVisible();

    // Donate button (disabled initially — no amount selected)
    const donateBtn = page.getByRole("button", { name: "Donate" });
    await expect(donateBtn).toBeVisible();
    await expect(donateBtn).toBeDisabled();
  });

  test("selecting amount enables donate button", async ({ page }) => {
    await page.goto("/donate");
    await expect(page.getByText("Support the Cause")).toBeVisible({
      timeout: 10_000,
    });

    // Click $10
    await page.getByRole("button", { name: "$10" }).click();

    // Donate button should be enabled
    const donateBtn = page.getByRole("button", { name: "Donate" });
    await expect(donateBtn).toBeEnabled();
  });

  test("custom amount input appears and works", async ({ page }) => {
    await page.goto("/donate");
    await expect(page.getByText("Support the Cause")).toBeVisible({
      timeout: 10_000,
    });

    // Click Custom
    await page.getByRole("button", { name: "Custom" }).click();

    // Custom input appears
    const customInput = page.locator("#custom-amount");
    await expect(customInput).toBeVisible();

    // Enter a valid amount
    await customInput.fill("15");

    // Donate button should be enabled
    const donateBtn = page.getByRole("button", { name: "Donate" });
    await expect(donateBtn).toBeEnabled();
  });

  test("donate button calls /api/donate and redirects (mocked)", async ({
    page,
  }) => {
    // Mock /api/donate to return a fake Stripe checkout URL
    await page.route("**/api/donate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "https://checkout.stripe.com/test-session-id",
        }),
      });
    });

    // Intercept the Stripe redirect so the test doesn't navigate away
    let redirectedTo: string | null = null;
    await page.route("https://checkout.stripe.com/**", async (route) => {
      redirectedTo = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>Stripe Checkout Mock</body></html>",
      });
    });

    await page.goto("/donate");
    await expect(page.getByText("Support the Cause")).toBeVisible({
      timeout: 10_000,
    });

    // Select $25 and click donate
    await page.getByRole("button", { name: "$25" }).click();
    await page.getByRole("button", { name: "Donate" }).click();

    // Wait for navigation to the mocked Stripe checkout page
    // (the redirect via window.location.href is near-instant, so we
    //  verify navigation happened rather than checking intermediate text)
    await page.waitForURL("**/checkout.stripe.com/**", { timeout: 10_000 });
    expect(redirectedTo).toContain("checkout.stripe.com");
  });

  test("success state renders thank you page", async ({ page }) => {
    await page.goto("/donate?success=true");
    await expect(page.getByText("Thank You")).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/your support keeps this platform free/i)
    ).toBeVisible();
  });

  test("cancelled state shows cancellation notice", async ({ page }) => {
    await page.goto("/donate?cancelled=true");
    await expect(
      page.getByText("Donation cancelled. No charge was made.")
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Navigation between pages
// ---------------------------------------------------------------------------
test.describe("Navigation", () => {
  test("footer links navigate between all main pages", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DEINDEX/i);

    const footer = page.locator("footer");
    await expect(footer).toBeVisible({ timeout: 30_000 });

    // Navigate to Database via footer
    await footer.getByRole("link", { name: "Database" }).click();
    await expect(page.getByText("The Open Directory")).toBeVisible({
      timeout: 10_000,
    });

    // Navigate to About via footer
    await page.locator("footer").getByRole("link", { name: "About" }).click();
    await expect(
      page.getByRole("heading", { name: "The Cause" })
    ).toBeVisible({ timeout: 10_000 });

    // Navigate to Donate via footer
    await page.locator("footer").getByRole("link", { name: "Donate" }).click();
    await expect(page.getByText("Support the Cause")).toBeVisible({
      timeout: 10_000,
    });

    // Navigate to Privacy via footer
    await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveTitle(/Privacy/i, { timeout: 10_000 });

    // Navigate to Terms via footer
    await page.locator("footer").getByRole("link", { name: "Terms" }).click();
    await expect(page).toHaveTitle(/Terms/i, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Language switching (i18n)
// ---------------------------------------------------------------------------
test.describe("Language switching", () => {
  test("switch from English to French and back", async ({ page }) => {
    await page.goto("/database");
    await expect(page.getByText("The Open Directory")).toBeVisible({
      timeout: 10_000,
    });

    // Open language switcher in footer
    const langButton = page.locator("footer").getByRole("button", {
      name: /EN/i,
    });
    await expect(langButton).toBeVisible();
    await langButton.click();

    // Select French
    const frOption = page.getByRole("option", { name: "FR" }).locator("button");
    await expect(frOption).toBeVisible();
    await frOption.click();

    // URL should contain /fr/
    await page.waitForURL(/\/fr\//);

    // French title for database page
    await expect(page.getByText("Le Repertoire Ouvert")).toBeVisible({
      timeout: 10_000,
    });

    // French nav labels in footer
    await expect(
      page.locator("footer").getByRole("link", { name: "Faire un don" })
    ).toBeVisible();

    // Switch back to English
    const frLangButton = page.locator("footer").getByRole("button", {
      name: /FR/i,
    });
    await frLangButton.click();

    const enOption = page.getByRole("option", { name: "EN" }).locator("button");
    await expect(enOption).toBeVisible();
    await enOption.click();

    await page.waitForURL(/\/en\//);
    await expect(page.getByText("The Open Directory")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("French locale renders French content on landing page", async ({
    page,
  }) => {
    await page.goto("/fr");
    await expect(page).toHaveTitle(/DEINDEX/i);

    // French tagline
    await expect(
      page.getByText("L'invisible est le nouveau luxe")
    ).toBeVisible({ timeout: 30_000 });
  });
});

// ---------------------------------------------------------------------------
// Error states
// ---------------------------------------------------------------------------
test.describe("Error states", () => {
  test("expired token shows error on /detonate", async ({ page }) => {
    const expiredToken = await createExpiredToken();
    await page.goto(`/detonate?token=${encodeURIComponent(expiredToken)}`);

    // Should show an error about the expired/invalid link
    await expect(
      page.getByText(/expired|invalid/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("network failure during scan shows error state", async ({ page }) => {
    test.setTimeout(120_000);

    // Mock /api/scan to return a server error
    await page.route("**/api/scan", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    // Block Turnstile
    await page.route("**/challenges.cloudflare.com/**", (route) =>
      route.abort()
    );

    const token = await createTestToken();
    await page.goto(`/detonate?token=${encodeURIComponent(token)}`);

    // The mocked 500 returns instantly, so the scan phase may flash by.
    // Wait for the error heading which appears when phase reverts to "idle"
    // with an error set (DetonatorFlow renders t("error") = "Error" heading).
    await expect(
      page.getByText(/error|failed|Internal server error/i).first()
    ).toBeVisible({ timeout: 30_000 });
  });

  test("missing token shows Invalid Link", async ({ page }) => {
    await page.goto("/detonate");
    await expect(page.getByText("Invalid Link")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("garbage token shows error", async ({ page }) => {
    await page.goto("/detonate?token=not-a-valid-jwt");
    await expect(
      page.getByText(/invalid|error|expired/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
