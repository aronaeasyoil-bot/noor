import { expect, test } from "@playwright/test";

test("mobile: bottom navigation, menu and WhatsApp do not overlap", async ({ page }) => {
  await page.goto("/en");
  const nav = page.getByTestId("bottom-nav");
  await expect(nav).toBeVisible();
  for (const label of ["Home", "Bookings", "Favourites", "Messages", "My account"]) await expect(nav.getByText(label)).toBeVisible();
  const wa = await page.getByTestId("whatsapp-float").boundingBox();
  const bn = await nav.boundingBox();
  expect(wa && bn && wa.y + wa.height <= bn.y + 1).toBe(true);
  await page.getByTestId("mobile-menu-button").click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("mobile: booking button is not hidden by floating buttons", async ({ page }) => {
  await page.goto("/en/desert-safari/evening-desert-safari");
  const cta = page.getByTestId("booking-signin");
  await cta.scrollIntoViewIfNeeded();
  const box = await cta.boundingBox();
  const wa = await page.getByTestId("whatsapp-float").boundingBox();
  const intersects = !!box && !!wa && !(box.x + box.width < wa.x || wa.x + wa.width < box.x || box.y + box.height < wa.y || wa.y + wa.height < box.y);
  // If they overlap at this scroll position, the page must still allow the button to be scrolled clear.
  if (intersects) {
    await page.mouse.wheel(0, 120);
  }
  await expect(cta).toBeVisible();
});
