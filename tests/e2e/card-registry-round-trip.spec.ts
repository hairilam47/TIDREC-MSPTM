/**
 * E2E: Admin card registry + row layout round-trip
 *
 * Flow: admin logs in → Settings → adds a custom card → places it in Row 1
 *       → saves → marketing site homepage shows the card in the co-organisers strip.
 *
 * Admin credentials are seeded by artifacts/api-server/src/lib/startupSync.ts.
 * Settings keys persisted: co_organisers_cards_json, co_organisers_section_rows_json (PUT /api/settings).
 * Marketing homepage at / parses those keys and renders a card grid.
 */
import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@seat-msptm2027.org";
const ADMIN_PASSWORD = "admin123";
const CARD_NAME = `TestOrg_e2e_${Date.now().toString(36)}`;

test.describe("Card registry round-trip", () => {
  test("admin adds a custom card, assigns it to Row 1, saves; card appears on the marketing homepage", async ({
    page,
  }) => {
    /* ── 1. Log in as admin ── */
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\//);

    /* ── 2. Navigate to Settings ── */
    await page.goto("/admin/settings");
    await expect(
      page.getByText("Co-organiser Card Registry", { exact: false })
    ).toBeVisible();

    /* ── 3. Add a new custom card ── */
    const nameInput = page.getByPlaceholder("e.g. Ministry of Health");
    await nameInput.scrollIntoViewIfNeeded();
    await nameInput.fill(CARD_NAME);

    const roleInput = page.getByPlaceholder("e.g. Knowledge Partner");
    await roleInput.fill("Knowledge Partner");

    await page.getByRole("button", { name: /add card/i }).click();

    /* ── 4. Card should appear in the "Not shown" pool ── */
    const notShownSection = page.getByText("Not shown (unassigned cards)", {
      exact: false,
    });
    await notShownSection.scrollIntoViewIfNeeded();
    await expect(page.getByText(CARD_NAME).first()).toBeVisible();

    /* ── 5. Assign the card to Row 1 via the "Add to row…" dropdown ── */
    const cardChip = page
      .locator("div", { hasText: CARD_NAME })
      .filter({ has: page.locator('select[title="Move to row"], select') })
      .last();

    const addToRowSelect = cardChip.locator("select").last();
    await addToRowSelect.selectOption({ index: 1 });

    /* ── 6. Card should move out of "Not shown" and appear inside Row 1 ── */
    const row1Cards = page.locator("div").filter({ hasText: /Row 1/ }).first();
    await expect(row1Cards.getByText(CARD_NAME)).toBeVisible({ timeout: 5000 });

    /* ── 7. Save changes (fixed bottom bar) ── */
    const saveBtn = page
      .getByRole("button", { name: /save changes/i })
      .last();
    await saveBtn.click();

    await expect(
      page.getByText(/saved/i).or(page.getByText(/settings saved/i))
    ).toBeVisible({ timeout: 10_000 });

    /* ── 8. Visit the marketing homepage in a fresh context ── */
    const context2 = await page.context().browser()!.newContext();
    const homePage = await context2.newPage();
    await homePage.goto("/");

    /* ── 9. The co-organisers strip must contain the new card ── */
    const strip = homePage.locator("section.py-12");
    await strip.scrollIntoViewIfNeeded();
    await expect(homePage.getByText(CARD_NAME).first()).toBeVisible({
      timeout: 10_000,
    });

    await context2.close();
  });
});
