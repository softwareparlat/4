import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Sessions table for session storage
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("client"), // 'admin', 'client', 'partner'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partners table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  referralCode: varchar("referral_code", { length: 50 }).unique().notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("25.00"),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled'
  progress: integer("progress").notNull().default(0), // 0-100
  clientId: integer("client_id").references(() => users.id).notNull(),
  partnerId: integer("partner_id").references(() => partners.id),
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'converted', 'paid'
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  priority: varchar("priority", { length: 50 }).notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  userId: integer("user_id").references(() => users.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'completed', 'failed'
  paymentMethod: varchar("payment_method", { length: 100 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio table
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'E-commerce', 'Dashboard', 'Mobile App', etc.
  technologies: text("technologies").notNull(), // JSON string with tech stack
  imageUrl: text("image_url").notNull(),
  demoUrl: text("demo_url"),
  completedAt: timestamp("completed_at").notNull(),
  featured: boolean("featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"), // 'info', 'success', 'warning', 'error'
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  partner: one(partners, {
    fields: [users.id],
    references: [partners.userId],
  }),
  projects: many(projects),
  tickets: many(tickets),
  referrals: many(referrals),
  notifications: many(notifications),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, {
    fields: [partners.userId],
    references: [users.id],
  }),
  projects: many(projects),
  referrals: many(referrals),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
  partner: one(partners, {
    fields: [projects.partnerId],
    references: [partners.id],
  }),
  payments: many(payments),
  tickets: many(tickets),
  referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  partner: one(partners, {
    fields: [referrals.partnerId],
    references: [partners.id],
  }),
  client: one(users, {
    fields: [referrals.clientId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [referrals.projectId],
    references: [projects.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tickets.projectId],
    references: [projects.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  project: one(projects, {
    fields: [payments.projectId],
    references: [projects.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
});

export const selectPartnerSchema = createSelectSchema(partners);

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectProjectSchema = createSelectSchema(projects);

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectTicketSchema = createSelectSchema(tickets);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const selectNotificationSchema = createSelectSchema(notifications);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type InsertPortfolio = typeof portfolio.$inferInsert;
export type Portfolio = typeof portfolio.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.enum(["client", "partner"]),
});

export const contactSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  company: z.string().optional(),
  serviceType: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  acceptTerms: z.boolean().refine(val => val === true, "Debes aceptar los términos"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;