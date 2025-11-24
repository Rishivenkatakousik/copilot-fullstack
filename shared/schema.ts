// import { sql } from "drizzle-orm";
// import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
// import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, varchar, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Languages table - stores supported programming languages
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // python, javascript, cpp, etc.
  name: varchar("name", { length: 100 }).notNull(), // Python, JavaScript, C++, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Code generations table - stores each code generation
export const codeGenerations = pgTable("code_generations", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  languageId: integer("language_id").notNull().references(() => languages.id),
  code: text("code").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Define relations
export const languagesRelations = relations(languages, ({ many }) => ({
  codeGenerations: many(codeGenerations),
}));

export const codeGenerationsRelations = relations(codeGenerations, ({ one }) => ({
  language: one(languages, {
    fields: [codeGenerations.languageId],
    references: [languages.id],
  }),
}));

// Zod schemas for validation
export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
  createdAt: true,
});

export const selectLanguageSchema = createSelectSchema(languages);

export const insertCodeGenerationSchema = createInsertSchema(codeGenerations).omit({
  id: true,
  timestamp: true,
});

export const selectCodeGenerationSchema = createSelectSchema(codeGenerations);

// Types
export type Language = typeof languages.$inferSelect;
export type InsertLanguage = typeof languages.$inferInsert;
export type CodeGeneration = typeof codeGenerations.$inferSelect;
export type InsertCodeGeneration = typeof codeGenerations.$inferInsert;

// Code language enum (for frontend validation)
export const codeLanguages = ["python", "javascript", "cpp", "java", "typescript", "go", "csharp"] as const;
export type CodeLanguage = typeof codeLanguages[number];

// API request/response schemas
export const generateRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  language: z.enum(codeLanguages),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export interface GenerateResponse {
  code: string;
  id?: number;
}

// History response with language details
export interface HistoryItem {
  id: number;
  prompt: string;
  language: {
    code: string;
    name: string;
  };
  code: string;
  timestamp: Date;
}

export interface HistoryResponse {
  data: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Frontend prompt history (for localStorage)
export interface PromptHistory {
  id: string;
  prompt: string;
  language: CodeLanguage;
  code: string;
  timestamp: number;
}
