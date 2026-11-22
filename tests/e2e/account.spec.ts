import { expect, test } from "@playwright/test";
import { ADMIN, register, signIn, uniqueEmail } from "./fixtures";

test.describe.configure({ mode: "serial" });

const email = uniqueEmail("cust");

test("register, sign out, wrong password, sign in", async ({ page }) => {
  await register(page, email);
  await expect(page.getByTestId("profile-form")).toBeVisible();
  await page.getByTestId("signout").click();
  await page.waitForURL(/\/en$/);
  await signIn(page, email, "not-the-password");
  await expect(page.getByTestId("auth-error")).toContainText("Incorrect email or password");
  await signIn(page, email, "a-strong-test-pass-1");
  await page.waitForURL(/\/en\/account$/);
});

test("password reset never reveals whether an account exists", async ({ page }) => {
  await page.goto("/en/account/forgot");
  await page.getByLabel("Email").fill("nobody-here@noor.test");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("If an account exists for this email")).toBeVisible();
});

test("account pages require sign-in", async ({ page }) => {
  await page.goto("/en/account/bookings");
  await expect(page).toHaveURL(/\/en\/account\/sign-in\?next=/);
});

test("booking request for an unpriced safari is saved as a request, then cancelled", async ({ page }) => {
  await signIn(page, email, "a-strong-test-pass-1", "/en/desert-safari/evening-desert-safari");
  await page.waitForURL(/evening-desert-safari/);
  await expect(page.getByText("Price on request").first()).toBeVisible();
  const form = page.getByTestId("booking-form");
  await form.getByLabel("Phone (with country code)").fill("+221 77 000 00 00");
  await form.getByTestId("booking-submit").click();
  await page.waitForURL(/\/en\/account\/bookings\/NB-[A-Z0-9]{6}\?new=1/);
  await expect(page.getByTestId("booking-created")).toContainText("booking request has been received");
  await expect(page.getByTestId("status")).toHaveText("Request received");
  await page.getByTestId("cancel-booking").click();
  await expect(page.getByTestId("status")).toHaveText("Cancelled");
  await page.goto("/en/account/bookings");
  await expect(page.getByTestId("booking-list")).toBeVisible();
});

test("favourites are saved to the account", async ({ page }) => {
  await signIn(page, email, "a-strong-test-pass-1", "/en/desert-safari");
  await page.waitForURL(/desert-safari/);
  await page.getByTestId("favorite-camel-riding").first().click();
  await expect(page.getByTestId("favorite-camel-riding").first()).toHaveAttribute("aria-pressed", "true");
  await page.goto("/en/account/favorites");
  await expect(page.getByTestId("card-camel-riding")).toBeVisible();
});

test("a customer cannot open the back office", async ({ page }) => {
  await signIn(page, email, "a-strong-test-pass-1");
  await page.waitForURL(/\/en\/account$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/forbidden$/);
  await page.goto("/admin/settings");
  await expect(page).toHaveURL(/\/admin\/forbidden$/);
});

test("super admin sets a price; the public page shows it and the slot calendar works", async ({ page }) => {
  await signIn(page, ADMIN.email, ADMIN.password, "/admin");
  await page.waitForURL(/\/admin$/);
  await expect(page.getByTestId("kpi").first()).toBeVisible();
  await page.goto("/admin/products#morning-desert-safari");
  const row = page.locator("#morning-desert-safari");
  await row.locator('input[name="price"]').fill("185");
  await row.locator('input[name="requiresSlot"]').check();
  await row.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/saved=morning-desert-safari/);
  await page.goto("/admin/availability?slug=morning-desert-safari");
  await page.locator('input[name="times"]').fill("06:00");
  await page.locator('input[name="capacity"]').fill("2");
  await page.getByRole("button", { name: "Open dates" }).click();
  await expect(page.getByText(/slot\(s\) created/)).toBeVisible();
  await page.goto("/en/desert-safari/morning-desert-safari");
  await expect(page.getByTestId("price").first()).toContainText("185");
});

test("slot capacity cannot be overbooked", async ({ page }) => {
  await signIn(page, email, "a-strong-test-pass-1", "/en/desert-safari/morning-desert-safari");
  await page.waitForURL(/morning-desert-safari/);
  const form = page.getByTestId("booking-form");
  // 2 seats left, 2 adults by default; adding a child must be blocked (button disabled).
  await form.getByRole("button", { name: "Children +" }).click();
  await expect(form.getByTestId("booking-submit")).toBeDisabled();
});

test.afterAll(async ({ browser }) => {
  // Reset the test price so the catalogue stays "on request" for other runs.
  const page = await browser.newPage();
  await signIn(page, ADMIN.email, ADMIN.password, "/admin/products");
  await page.waitForURL(/\/admin\/products/);
  const row = page.locator("#morning-desert-safari");
  await row.locator('input[name="price"]').fill("");
  await row.locator('input[name="requiresSlot"]').uncheck();
  await row.getByRole("button", { name: "Save" }).click();
  await page.close();
});
