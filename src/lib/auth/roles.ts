import type { Role } from "@/lib/db/schema";

export const STAFF_ROLES: Role[] = ["super_admin", "admin", "booking_agent", "support_agent", "finance"];

/** What each back-office area requires. Checked on the server for every admin page and action. */
export const permissions = {
  dashboard: [...STAFF_ROLES, "supplier"],
  bookings: ["super_admin", "admin", "booking_agent", "support_agent"],
  bookingsWrite: ["super_admin", "admin", "booking_agent"],
  quotes: ["super_admin", "admin", "booking_agent", "support_agent"],
  customers: ["super_admin", "admin", "support_agent"],
  products: ["super_admin", "admin", "booking_agent", "supplier"],
  productsPricing: ["super_admin", "admin", "supplier"],
  visas: ["super_admin", "admin", "support_agent", "booking_agent"],
  suppliers: ["super_admin", "admin"],
  payments: ["super_admin", "admin", "finance"],
  refunds: ["super_admin", "finance"],
  promotions: ["super_admin", "admin"],
  content: ["super_admin", "admin", "support_agent"],
  settings: ["super_admin"],
  users: ["super_admin"],
  reports: ["super_admin", "admin", "finance"],
} satisfies Record<string, Role[]>;

export type Permission = keyof typeof permissions;

export function can(role: Role | undefined | null, permission: Permission): boolean {
  return !!role && (permissions[permission] as Role[]).includes(role);
}

export function isStaff(role: Role | undefined | null): boolean {
  return !!role && (STAFF_ROLES.includes(role) || role === "supplier");
}
