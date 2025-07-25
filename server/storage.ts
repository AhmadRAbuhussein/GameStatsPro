import { type Player, type InsertPlayer, type Match, type InsertMatch, type GameStats, type InsertGameStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPlayer(gameId: string, playerId: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  
  getMatches(playerId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  
  getGameStats(playerId: string): Promise<GameStats | undefined>;
  createGameStats(stats: InsertGameStats): Promise<GameStats>;
  updateGameStats(playerId: string, updates: Partial<GameStats>): Promise<GameStats | undefined>;
}

export class MemStorage implements IStorage {
  private players: Map<string, Player>;
  private matches: Map<string, Match>;
  private gameStats: Map<string, GameStats>;

  constructor() {
    this.players = new Map();
    this.matches = new Map();
    this.gameStats = new Map();
  }

  async getPlayer(gameId: string, playerId: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.gameId === gameId && player.playerId === playerId
    );
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { 
      ...insertPlayer, 
      id, 
      region: insertPlayer.region || null,
      lastUpdated: new Date() 
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer: Player = { 
      ...player, 
      ...updates, 
      lastUpdated: new Date() 
    };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async getMatches(playerId: string): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter((match) => match.playerId === playerId)
      .sort((a, b) => (b.playedAt?.getTime() || 0) - (a.playedAt?.getTime() || 0));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = { 
      ...insertMatch, 
      id,
      playerId: insertMatch.playerId || null 
    };
    this.matches.set(id, match);
    return match;
  }

  async getGameStats(playerId: string): Promise<GameStats | undefined> {
    return Array.from(this.gameStats.values()).find(
      (stats) => stats.playerId === playerId
    );
  }

  async createGameStats(insertStats: InsertGameStats): Promise<GameStats> {
    const id = randomUUID();
    const stats: GameStats = { 
      ...insertStats, 
      id,
      playerId: insertStats.playerId || null,
      updatedAt: new Date() 
    };
    this.gameStats.set(id, stats);
    return stats;
  }

  async updateGameStats(playerId: string, updates: Partial<GameStats>): Promise<GameStats | undefined> {
    const existingStats = Array.from(this.gameStats.values()).find(
      (stats) => stats.playerId === playerId
    );
    if (!existingStats) return undefined;
    
    const updatedStats: GameStats = { 
      ...existingStats, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.gameStats.set(existingStats.id, updatedStats);
    return updatedStats;
  }
}

export const storage = new MemStorage();
