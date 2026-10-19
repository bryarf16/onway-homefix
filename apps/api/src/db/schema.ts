import { pgTable, text, timestamp, integer, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. پێناسەکردنی دۆخەکانی ڕۆڵ و حجزکردن
export const roleEnum = pgEnum("role", ["customer", "admin"]);
export const bookingStatusEnum = pgEnum("booking_status", [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
]);

// 2. خشتەی بەکارهێنەران (Users)
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").default("customer").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. خشتەی بەشەکان (Categories)
export const categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    nameCkb: text("name_ckb").notNull(),
    icon: text("icon"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. خشتەی وەستاکان (Providers)
export const providers = pgTable("providers", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    categoryId: uuid("category_id")
        .references(() => categories.id)
        .notNull(),
    city: text("city").notNull(),
    phone: text("phone").notNull(),
    hourlyRate: integer("hourly_rate").notNull(), // نرخ بە دینار
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. خشتەی داواکارییەکان (Bookings)
export const bookings = pgTable("bookings", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
        .references(() => users.id)
        .notNull(),
    providerId: uuid("provider_id")
        .references(() => providers.id)
        .notNull(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    scheduledAt: timestamp("scheduled_at").notNull(),
    notes: text("notes"),
    status: bookingStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. پەیوەندی نێوان خشتەکان (Relations)
export const categoriesRelations = relations(categories, ({ many }) => ({
    providers: many(providers),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
    category: one(categories, {
        fields: [providers.categoryId],
        references: [categories.id],
    }),
    bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
    customer: one(users, {
        fields: [bookings.customerId],
        references: [users.id],
    }),
    provider: one(providers, {
        fields: [bookings.providerId],
        references: [providers.id],
    }),
}));
