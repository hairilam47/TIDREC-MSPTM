/**
 * E2E: Footer logo fallback
 *
 * When no footer logo image is configured for a co-organiser (msptm-footer,
 * tidrec-footer, uitm-footer), the footer "Organisers" column must render the
 * organiser's short name as bold white text instead of a broken <img>.
 *
 * Relevant code: artifacts/symposium/src/pages/Home.tsx — footer section.
 * hasLogo check: Boolean(cmsRecord?.co_organiser_{slug}_footer_logo || cmsRecord?.co_organiser_{slug}_logo)
 * Fallback render: <span className="font-bold text-white text-xs">{fallback}</span>
 */
import { test, expect } from "@playwright/test";

const ORGANISERS = [
  {
    slug: "msptm-footer",
    fallback: "MSPTM",
    fullName: "Malaysian Society of Parasitology",
  },
  {
    slug: "tidrec-footer",
    fallback: "TIDREC",
    fullName: "Tropical Infectious Diseases Research",
  },
  {
    slug: "uitm-footer",
    fallback: "UiTM",
    fullName: "Universiti Teknologi MARA",
  },
];

test.describe("Footer logo fallback", () => {
  test("footer Organisers column renders logo or text fallback, and full name labels are present", async ({
    page,
  }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    for (const { slug, fallback, fullName } of ORGANISERS) {
      const logoImg = footer.locator(`img[src*="${slug}"]`);
      const fallbackSpan = footer.locator(`span`, { hasText: fallback }).filter({
        has: page.locator('span.font-bold, span[class*="font-bold"]'),
      });

      const hasImg = (await logoImg.count()) > 0 && (await logoImg.first().isVisible());
      const hasText = (await fallbackSpan.count()) > 0;

      expect(
        hasImg || hasText,
        `${slug}: expected either a logo <img> or the fallback text "${fallback}" to be rendered`
      ).toBe(true);

      await expect(
        footer.getByText(fullName, { exact: false }),
        `${slug}: full name should be visible in the footer`
      ).toBeVisible();
    }
  });

  test("when a co-organiser has no logo configured, the text fallback is shown (not a broken image)", async ({
    page,
  }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    let atLeastOneChecked = false;

    for (const { slug, fallback } of ORGANISERS) {
      const logoImg = footer.locator(`img[src*="${slug}"]`);
      const imgCount = await logoImg.count();

      if (imgCount === 0) {
        const fallbackSpan = footer.getByText(fallback, { exact: true });
        await expect(
          fallbackSpan.first(),
          `No logo for ${slug} — bold text fallback "${fallback}" should be visible`
        ).toBeVisible();
        atLeastOneChecked = true;
      } else {
        const img = logoImg.first();
        const isVisible = await img.isVisible();
        if (isVisible) {
          const naturalWidth = await img.evaluate(
            (el: HTMLImageElement) => el.naturalWidth
          );
          expect(
            naturalWidth,
            `Logo image for ${slug} must load without error (naturalWidth > 0)`
          ).toBeGreaterThan(0);
          atLeastOneChecked = true;
        }
      }
    }

    expect(
      atLeastOneChecked,
      "At least one organiser logo or fallback must have been verified"
    ).toBe(true);
  });
});
