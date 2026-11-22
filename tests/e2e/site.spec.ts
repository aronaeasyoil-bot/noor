import { expect, test } from "@playwright/test";

test("home page shows every section in the required order", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore the World with NOOR");
  const titles = await page.locator("main h2").allTextContents();
  const expected = [
    "Exclusive Travel Deals",
    "Popular Destinations",
    "Trending Flights",
    "Recommended Hotels",
    "Discover Dubai",
    "Desert Safari Experiences",
    "Car Rentals",
    "Airport Transfers",
    "Holiday Packages",
    "Travel from Africa to Dubai",
    "Tours & Activities",
    "Why Book with NOOR",
    "Customer Reviews",
    "Travel Inspiration",
    "Get travel ideas and NOOR offers",
  ];
  const positions = expected.map((t) => titles.findIndex((x) => x.trim() === t));
  expect(positions.every((p) => p >= 0)).toBe(true);
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  await expect(page.locator("footer")).toBeVisible();
  // No invented reviews: empty state until verified bookings exist.
  await expect(page.getByTestId("reviews-empty")).toBeVisible();
});

test("official logo is used", async ({ page }) => {
  await page.goto("/en");
  const src = await page.getByRole("link", { name: "NOOR Travel & Tours" }).first().locator("img").getAttribute("src");
  expect(src).toContain("noor-logo-official");
});

test("WhatsApp button is translated and prefilled", async ({ page }) => {
  for (const [l, label] of [
    ["en", "Need help? Chat with a NOOR agent"],
    ["fr", "Besoin d'aide ? Discuter avec un agent de Noor"],
    ["ar", "هل تحتاج إلى مساعدة؟ تحدث مع أحد ممثلي نور"],
  ] as const) {
    await page.goto(`/${l}`);
    const wa = page.getByTestId("whatsapp-float");
    await expect(wa).toHaveAttribute("aria-label", label);
    const href = await wa.getAttribute("href");
    expect(href).toMatch(/^https:\/\/wa\.me\/971504921527\?text=/);
  }
  await page.goto("/fr");
  const href = await page.getByTestId("whatsapp-float").getAttribute("href");
  expect(decodeURIComponent(href!.split("text=")[1]!)).toBe("Bonjour NOOR, j'ai besoin d'aide pour organiser mon voyage.");
});

test("languages and RTL", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await page.goto("/fr/desert-safari");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("group", { name: /Langue/i }).getByRole("link", { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en\/desert-safari$/);
});

test("root redirects by browser language", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "fr-FR", extraHTTPHeaders: { "accept-language": "fr-FR,fr;q=0.9" } });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
  await ctx.close();
});

test("currency switch is labelled as indicative", async ({ page }) => {
  await page.goto("/en/desert-safari");
  await expect(page.getByTestId("currency-note")).toContainText("AED");
  await page.getByTestId("currency-select").first().selectOption("USD");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("currency-select").first()).toHaveValue("USD");
});

test("search tabs and honest flight results", async ({ page }) => {
  await page.goto("/en");
  for (const t of ["hotels", "flightHotel", "cars", "transfers", "activities", "flights"]) {
    await page.getByTestId(`search-tab-${t}`).click();
    await expect(page.getByTestId(`search-tab-${t}`)).toHaveAttribute("aria-selected", "true");
  }
  // Validation: same city is refused client-side.
  await page.getByRole("combobox", { name: "To", exact: true }).fill("Dubai (DXB)");
  await page.getByTestId("search-submit").click();
  await expect(page.getByText("Origin and destination must be different.")).toBeVisible();
  await page.getByRole("combobox", { name: "To", exact: true }).fill("London (LHR)");
  await page.getByTestId("search-submit").click();
  await page.waitForURL(/\/en\/flights\/search/);
  await expect(page.getByTestId("supplier-notice")).toBeVisible();
  await expect(page.getByTestId("flight-results")).toHaveCount(0);
});

test("quote request is stored and returns a reference", async ({ page }) => {
  await page.goto("/en/flights/search?trip=oneway&from=DSS&to=DXB&depart=2027-01-15&adults=2");
  const form = page.getByTestId("quote-form");
  await form.getByLabel("Full name").fill("Awa Diop");
  await form.getByLabel("Email").fill("awa@noor.test");
  await form.getByRole("checkbox").check();
  await form.getByTestId("quote-submit").click();
  await expect(page.getByTestId("quote-success")).toContainText(/NQ-[A-Z0-9]{6}/);
});

test("activities search filters the catalogue", async ({ page }) => {
  await page.goto("/en/activities?q=burj");
  await expect(page.getByTestId("card-burj-khalifa")).toBeVisible();
  await expect(page.getByTestId("card-water-parks")).toHaveCount(0);
  await page.goto("/en/activities?q=zzzz");
  await expect(page.getByTestId("no-activity")).toBeVisible();
});

test("Africa page lists the 11 departure cities", async ({ page }) => {
  await page.goto("/fr/africa-to-dubai");
  for (const c of ["dakar", "abidjan", "bamako", "conakry", "lagos", "accra", "casablanca", "douala", "kinshasa", "nairobi", "addis-ababa"]) {
    await expect(page.getByTestId(`city-${c}`)).toBeVisible();
  }
});

test("visa page carries the authority disclaimer and requires an account", async ({ page }) => {
  await page.goto("/en/visa");
  await expect(page.getByTestId("visa-disclaimer")).toContainText("competent authorities");
  await expect(page.getByRole("link", { name: "Sign in" }).last()).toBeVisible();
});

test("all images have alt text and come from licensed sources", async ({ page }) => {
  for (const path of ["/en", "/en/desert-safari", "/en/africa-to-dubai", "/en/cars"]) {
    await page.goto(path);
    const imgs = await page.locator("img").evaluateAll((els) => els.map((e) => ({ src: (e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src, alt: e.getAttribute("alt") })));
    expect(imgs.length).toBeGreaterThan(3);
    for (const i of imgs) {
      expect(i.alt, i.src).toBeTruthy();
      expect(i.src).toMatch(/images\.unsplash\.com|\/brand\/|\/images\/fallback/);
    }
  }
});

test("internal links from the home page resolve", async ({ page, request }) => {
  await page.goto("/en");
  const hrefs = [...new Set(await page.locator('a[href^="/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")!.split("#")[0]!)))];
  const bad: string[] = [];
  for (const h of hrefs) {
    const r = await request.get(h, { maxRedirects: 0 });
    if (r.status() >= 400) bad.push(`${h} ${r.status()}`);
  }
  expect(bad).toEqual([]);
});

const widths = [320, 375, 390, 430, 768, 1024, 1440];
for (const w of widths) {
  test(`no horizontal overflow at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    for (const path of ["/en", "/ar", "/en/desert-safari/evening-desert-safari", "/fr/flights/search?trip=round&from=DXB&to=CDG&depart=2027-01-10&return=2027-01-20"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
}
