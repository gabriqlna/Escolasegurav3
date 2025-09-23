import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access control - matching Python/Kivy system
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  role: text("role").$type<"aluno" | "funcionario" | "direcao">().notNull().default("aluno"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reports/Incidents table - matching Python/Kivy system
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'Bullying', 'Drogas', 'Vandalismo', 'Ameaça', 'Outro'
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  reporterId: varchar("reporter_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, in_progress, resolved, rejected
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolution: text("resolution"),
});

// Urgent notices table - matching Python/Kivy system  
export const notices = pgTable("notices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  targetAudience: text("target_audience").array().notNull(), // ['aluno', 'funcionario', 'direcao']
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Visitors table - matching Python/Kivy system
export const visitors = pgTable("visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  document: text("document").notNull(),
  phone: text("phone"),
  purpose: text("purpose").notNull(),
  hostName: text("host_name").notNull(),
  hostId: varchar("host_id").references(() => users.id),
  checkInTime: timestamp("check_in_time").defaultNow().notNull(),
  checkOutTime: timestamp("check_out_time"),
  status: text("status").notNull().default("checked_in"), // checked_in, checked_out
  badgeNumber: text("badge_number"),
  checkOutNote: text("check_out_note"),
  registeredBy: varchar("registered_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Occurrences table
export const occurrences = pgTable("occurrences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().default("medium"), // low, medium, high
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Safety checklist items
export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedBy: varchar("completed_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Emergency drills calendar
export const drills = pgTable("drills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  type: text("type").notNull().default("evacuation"), // evacuation, fire, earthquake, etc
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Educational campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // digital_safety, traffic_education, general
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Emergency alerts
export const emergencyAlerts = pgTable("emergency_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  location: text("location"),
  triggeredBy: varchar("triggered_by").references(() => users.id).notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  firebaseUid: true,
  role: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  type: true,
  description: true,
  isAnonymous: true,
});

export const insertNoticeSchema = createInsertSchema(notices).pick({
  title: true,
  content: true,
});

export const insertVisitorSchema = createInsertSchema(visitors).pick({
  name: true,
  document: true,
  purpose: true,
  hostName: true,
});

export const insertOccurrenceSchema = createInsertSchema(occurrences).pick({
  title: true,
  description: true,
  severity: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).pick({
  title: true,
  description: true,
});

export const insertDrillSchema = createInsertSchema(drills).pick({
  title: true,
  description: true,
  scheduledDate: true,
  type: true,
}).extend({
  scheduledDate: z.coerce.date(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  title: true,
  content: true,
  category: true,
});

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).pick({
  message: true,
  location: true,
});

// Update schemas for PATCH operations
export const updateUserSchema = insertUserSchema.partial();
export const updateNoticeSchema = insertNoticeSchema.partial();
export const updateCampaignSchema = insertCampaignSchema.partial();
export const updateChecklistItemSchema = insertChecklistItemSchema.partial().extend({
  isCompleted: z.boolean().optional(),
});

// Report status update schema
export const reportStatusSchema = z.object({
  status: z.enum(["pending", "reviewed", "resolved"]),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Visitor = typeof visitors.$inferSelect;
export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Occurrence = typeof occurrences.$inferSelect;
export type InsertOccurrence = z.infer<typeof insertOccurrenceSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type Drill = typeof drills.$inferSelect;
export type InsertDrill = z.infer<typeof insertDrillSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;

// User roles enum - matching Python/Kivy system
export const USER_ROLES = {
  ALUNO: "aluno" as const,
  FUNCIONARIO: "funcionario" as const,
  DIRECAO: "direcao" as const,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
