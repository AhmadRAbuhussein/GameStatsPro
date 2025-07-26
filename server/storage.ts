import { type Player, type InsertPlayer, type Match, type InsertMatch, type GameStats, type InsertGameStats, type User, type InsertUser, type OtpCode, type InsertOtpCode, type Session, type InsertSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Auth methods
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  createOtpCode(otp: InsertOtpCode): Promise<OtpCode>;
  getOtpCode(phone: string, code: string): Promise<OtpCode | undefined>;
  markOtpAsUsed(id: string): Promise<void>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Player methods
  getPlayer(gameId: string, playerId: string, userId: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  
  getMatches(playerId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  
  getGameStats(playerId: string): Promise<GameStats | undefined>;
  createGameStats(stats: InsertGameStats): Promise<GameStats>;
  updateGameStats(playerId: string, updates: Partial<GameStats>): Promise<GameStats | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private otpCodes: Map<string, OtpCode>;
  private sessions: Map<string, Session>;
  private players: Map<string, Player>;
  private matches: Map<string, Match>;
  private gameStats: Map<string, GameStats>;

  constructor() {
    this.users = new Map();
    this.otpCodes = new Map();
    this.sessions = new Map();
    this.players = new Map();
    this.matches = new Map();
    this.gameStats = new Map();
  }

  // Auth methods
  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      isVerified: false,
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createOtpCode(insertOtp: InsertOtpCode): Promise<OtpCode> {
    const id = randomUUID();
    const otp: OtpCode = {
      ...insertOtp,
      id,
      isUsed: false,
      createdAt: new Date(),
    };
    this.otpCodes.set(id, otp);
    return otp;
  }

  async getOtpCode(phone: string, code: string): Promise<OtpCode | undefined> {
    return Array.from(this.otpCodes.values()).find(
      otp => otp.phone === phone && otp.code === code && !otp.isUsed && otp.expiresAt > new Date()
    );
  }

  async markOtpAsUsed(id: string): Promise<void> {
    const otp = this.otpCodes.get(id);
    if (otp) {
      this.otpCodes.set(id, { ...otp, isUsed: true });
    }
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(sessionId);
    }
    return undefined;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  // Player methods
  async getPlayer(gameId: string, playerId: string, userId: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.gameId === gameId && player.playerId === playerId && player.userId === userId
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
