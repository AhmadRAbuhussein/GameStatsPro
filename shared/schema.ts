import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Authentication tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const otpCodes = pgTable("otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameId: text("game_id").notNull(),
  playerId: text("player_id").notNull(),
  username: text("username").notNull(),
  region: text("region"),
  level: integer("level"),
  rank: text("rank"),
  profileData: jsonb("profile_data"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => players.id),
  matchId: text("match_id").notNull(),
  gameMode: text("game_mode"),
  result: text("result"), // "victory" | "defeat"
  duration: integer("duration"), // in seconds
  champion: text("champion"),
  kda: text("kda"), // "kills/deaths/assists"
  cs: integer("cs"),
  lpChange: integer("lp_change"),
  matchData: jsonb("match_data"),
  playedAt: timestamp("played_at"),
});

export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => players.id),
  winRate: integer("win_rate"), // percentage
  averageKda: text("average_kda"),
  totalPlaytime: integer("total_playtime"), // in hours
  currentLp: integer("current_lp"),
  statsData: jsonb("stats_data"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auth schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  lastUpdated: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  updatedAt: true,
});

// Auth types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Game types
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;

// Frontend-only types for API responses
export type GameType = "lol" | "steam" | "valorant" | "cs2" | "dota2" | "clashroyale";

export type PlayerAnalytics = {
  player: Player;
  stats: GameStats;
  recentMatches: Match[];
  championStats?: Array<{
    name: string;
    role: string;
    winRate: number;
    games: number;
  }>;
};
