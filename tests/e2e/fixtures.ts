import type { Page } from "@playwright/test";

/** Local test admin created by `npm run db:seed` in CI/dev (never a production credential). */
export const ADMIN = { email: process.env.E2E_ADMIN_EMAIL ?? "admin@noor.test", password: process.env.E2E_ADMIN_PASSWORD ?? "Noor-Admin-Local-2026" };

export function uniqueEmail(tag: string) {
  return `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@noor.test`;
}

export async function register(page: Page, email: string, name = "Test Traveller") {
  await page.goto("/en/account/register");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.locator("#rg-pass").fill("a-strong-test-pass-1");
  await page.getByTestId("register-submit").click();
  await page.waitForURL(/\/en\/account$/);
}

export async function signIn(page: Page, email: string, password: string, next?: string) {
  await page.goto(`/en/account/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  await page.locator("#si-email").fill(email);
  await page.locator("#si-pass").fill(password);
  await page.getByTestId("signin-submit").click();
}
