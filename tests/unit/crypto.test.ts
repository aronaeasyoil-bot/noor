import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, sha256, randomToken, timingSafeEqual } from "@/lib/auth/crypto";

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const h = await hashPassword("correct horse battery");
    expect(h).toMatch(/^pbkdf2\$100000\$/);
    expect(await verifyPassword("correct horse battery", h)).toBe(true);
    expect(await verifyPassword("wrong password!!", h)).toBe(false);
  });
  it("uses a random salt", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });
  it("rejects malformed hashes", async () => {
    expect(await verifyPassword("x", "plain")).toBe(false);
  });
});

describe("tokens", () => {
  it("are random and hashed deterministically", async () => {
    const a = randomToken();
    expect(a).not.toBe(randomToken());
    expect(await sha256(a)).toBe(await sha256(a));
  });
  it("compares in constant time", () => {
    const e = new TextEncoder();
    expect(timingSafeEqual(e.encode("abc"), e.encode("abc"))).toBe(true);
    expect(timingSafeEqual(e.encode("abc"), e.encode("abd"))).toBe(false);
    expect(timingSafeEqual(e.encode("abc"), e.encode("abcd"))).toBe(false);
  });
});
