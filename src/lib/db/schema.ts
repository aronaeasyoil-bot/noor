import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "customer",
  "super_admin",
  "admin",
  "booking_agent",
  "support_agent",
  "finance",
  "supplier",
]);

export const productCategoryEnum = pgEnum("product_category", [
  "safari",
  "activity",
  "car",
  "transfer",
  "package",
  "service",
]);

export const productStatusEnum = pgEnum("product_status", ["draft", "active", "inactive"]);
export const priceUnitEnum = pgEnum("price_unit", ["per_person", "per_vehicle", "per_group", "per_day"]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "requested",
  "pending_payment",
  "confirmed",
  "cancellation_requested",
  "cancelled",
  "refunded",
  "failed",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "pending",
  "paid",
  "partially_refunded",
  "refunded",
  "failed",
]);

export const quoteStatusEnum = pgEnum("quote_status", ["new", "in_progress", "quoted", "closed"]);

export const visaStatusEnum = pgEnum("visa_status", [
  "submitted",
  "documents_required",
  "in_review",
  "submitted_to_authority",
  "approved",
  "rejected",
  "cancelled",
]);

export const reviewStatusEnum = pgEnum("review_status", ["pending", "published", "rejected"]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("customer"),
    supplierId: uuid("supplier_id"),
    locale: text("locale").notNull().default("en"),
    preferredCurrency: text("preferred_currency").notNull().default("AED"),
    disabled: boolean("disabled").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_idx").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // SHA-256 of the cookie token; the raw token is never stored
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const passwordResets = pgTable("password_resets", {
  id: text("id").primaryKey(), // SHA-256 of the emailed token
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const travellers = pgTable("travellers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  nationality: text("nationality"),
  createdAt: createdAt(),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemSlug: text("item_slug").notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemType, t.itemSlug] })],
);

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // flights | hotels | cars | transfers | activities | visa | other
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  integration: text("integration").notNull().default("manual"), // manual | amadeus | hotelbeds | ...
  active: boolean("active").notNull().default(true),
  notes: text("notes"),
  createdAt: createdAt(),
});

/**
 * Commercial settings for catalogue items. Editorial content (texts, photos) lives in code
 * (src/lib/catalog); prices and availability live here and are set by NOOR staff only.
 * A product without a price is shown as "price on request".
 */
export const products = pgTable("products", {
  slug: text("slug").primaryKey(),
  category: productCategoryEnum("category").notNull(),
  status: productStatusEnum("status").notNull().default("active"),
  priceMinor: integer("price_minor"), // AED fils; null = price on request
  currency: text("currency").notNull().default("AED"),
  priceUnit: priceUnitEnum("price_unit").notNull().default("per_person"),
  depositMinor: integer("deposit_minor"),
  minPax: integer("min_pax").notNull().default(1),
  maxPax: integer("max_pax").notNull().default(20),
  managedByNoor: boolean("managed_by_noor").notNull().default(true),
  requiresSlot: boolean("requires_slot").notNull().default(false),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  cancellationPolicy: text("cancellation_policy"),
  updatedAt: updatedAt(),
});

export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productSlug: text("product_slug")
      .notNull()
      .references(() => products.slug, { onDelete: "cascade" }),
    date: date("date").notNull(),
    startTime: text("start_time").notNull().default("00:00"),
    capacity: integer("capacity").notNull(),
    booked: integer("booked").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("slots_product_date_time_idx").on(t.productSlug, t.date, t.startTime)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone"),
    productType: text("product_type").notNull(),
    productSlug: text("product_slug").notNull(),
    productTitle: text("product_title").notNull(),
    travelDate: date("travel_date"),
    slotId: uuid("slot_id").references(() => availabilitySlots.id),
    adults: integer("adults").notNull().default(1),
    children: integer("children").notNull().default(0),
    infants: integer("infants").notNull().default(0),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    status: bookingStatusEnum("status").notNull().default("requested"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
    amountMinor: integer("amount_minor"),
    currency: text("currency").notNull().default("AED"),
    supplierReference: text("supplier_reference"),
    locale: text("locale").notNull().default("en"),
    internalNotes: text("internal_notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [index("bookings_user_idx").on(t.userId), index("bookings_status_idx").on(t.status)],
);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),
  provider: text("provider").notNull(),
  providerRef: text("provider_ref").unique(), // e.g. Stripe Checkout Session id
  providerPaymentId: text("provider_payment_id"),
  amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Every signed provider event is stored once; a replayed event id is ignored. */
export const paymentEvents = pgTable("payment_events", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id")
    .notNull()
    .references(() => payments.id),
  amountMinor: integer("amount_minor").notNull(),
  status: text("status").notNull().default("pending"),
  providerRef: text("provider_ref"),
  reason: text("reason"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: createdAt(),
});

export const quoteRequests = pgTable(
  "quote_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    service: text("service").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    message: text("message"),
    status: quoteStatusEnum("status").notNull().default("new"),
    assignedTo: uuid("assigned_to").references(() => users.id),
    internalNotes: text("internal_notes"),
    locale: text("locale").notNull().default("en"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("quotes_status_idx").on(t.status)],
);

export const visaApplications = pgTable("visa_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicantName: text("applicant_name").notNull(),
  nationality: text("nationality").notNull(),
  residence: text("residence"),
  destination: text("destination").notNull(),
  visaType: text("visa_type").notNull(),
  travelDate: date("travel_date"),
  message: text("message"),
  status: visaStatusEnum("status").notNull().default("submitted"),
  statusNote: text("status_note"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const visaDocuments = pgTable("visa_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => visaApplications.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  email: text("email").primaryKey(),
  locale: text("locale").notNull().default("en"),
  createdAt: createdAt(),
});

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    base: text("base").notNull(),
    quote: text("quote").notNull(),
    rate: numeric("rate", { precision: 18, scale: 8 }).notNull(),
    source: text("source").notNull(),
    rateDate: timestamp("rate_date", { withTimezone: true }).notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.base, t.quote] })],
);

export const promotions = pgTable("promotions", {
  code: text("code").primaryKey(),
  description: text("description").notNull(),
  percentOff: integer("percent_off"),
  amountOffMinor: integer("amount_off_minor"),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validTo: timestamp("valid_to", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

/** Only reviews attached to a completed booking can be published, so every public review is verified. */
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  createdAt: createdAt(),
});

export const kbArticles = pgTable("kb_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  locale: text("locale").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  keywords: text("keywords").notNull().default(""),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: updatedAt(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  data: jsonb("data"),
  createdAt: createdAt(),
});

export type User = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Product = typeof products.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type VisaApplication = typeof visaApplications.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
