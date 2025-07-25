import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;

// Frontend-only types for API responses
export type GameType = "lol" | "steam" | "valorant" | "cs2" | "dota2";

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
