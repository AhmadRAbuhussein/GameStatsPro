import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertGameStatsSchema, type PlayerAnalytics, type GameType, type User } from "@shared/schema";
import { z } from "zod";
import { randomInt } from "crypto";

// Request schemas
const playerRequestSchema = z.object({
  gameId: z.enum(["lol", "steam", "valorant", "cs2", "dota2", "clashroyale"]),
  playerId: z.string().min(1),
  region: z.string().optional(),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpVerificationSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP code must be 6 digits"),
});

const registrationSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
});

// Extended request interface with session support
declare module 'express-session' {
  interface SessionData {
    sessionId?: string;
  }
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Authentication middleware
async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const sessionId = req.session?.sessionId;
    if (!sessionId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Session expired" });
    }

    const user = await storage.getUserByEmail(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/request-otp", async (req, res) => {
    try {
      const { email } = emailSchema.parse(req.body);
      
      // Generate 6-digit OTP
      const code = randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store OTP
      await storage.createOtpCode({
        email,
        code,
        expiresAt,
      });
      
      // In a real app, send email here
      console.log(`OTP for ${email}: ${code}`);
      
      res.json({ 
        message: "OTP sent to your email",
        // For demo purposes, return the OTP
        otp: code 
      });
    } catch (error) {
      console.error("Error requesting OTP:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid email address",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, code } = otpVerificationSchema.parse(req.body);
      
      // Verify OTP
      const otp = await storage.getOtpCode(email, code);
      if (!otp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Mark OTP as used
      await storage.markOtpAsUsed(otp.id);
      
      // Check if user exists
      let user = await storage.getUserByEmail(email);
      const isNewUser = !user;
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          email,
          isVerified: true,
        });
      } else {
        // Update existing user as verified
        user = await storage.updateUser(user.id, {
          isVerified: true,
          lastLoginAt: new Date(),
        });
      }
      
      // Create session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const session = await storage.createSession({
        userId: user!.id,
        expiresAt,
      });
      
      // Set session in cookie
      req.session.sessionId = session.id;
      
      res.json({ 
        message: "OTP verified successfully",
        isNewUser,
        user: { id: user!.id, email: user!.email, isVerified: user!.isVerified }
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid OTP format",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  app.post("/api/auth/complete-registration", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { phone } = registrationSchema.omit({ email: true }).parse(req.body);
      
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(req.user.id, {
        phone: phone || null,
      });
      
      res.json({ 
        message: "Registration completed successfully",
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error completing registration:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid registration data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to complete registration" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionId = req.session?.sessionId;
      if (sessionId) {
        await storage.deleteSession(sessionId);
        req.session.destroy((err: any) => {
          if (err) console.error("Session destroy error:", err);
        });
      }
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    res.json({ 
      user: { 
        id: req.user!.id, 
        email: req.user!.email, 
        phone: req.user!.phone,
        isVerified: req.user!.isVerified 
      } 
    });
  });
  
  // Fetch player analytics
  app.get("/api/player/:gameId/:playerId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { gameId, playerId } = req.params;
      const { region } = req.query;

      // Validate request
      const validatedData = playerRequestSchema.parse({
        gameId,
        playerId,
        region: region as string,
      });

      // Check if player exists in storage
      let player = await storage.getPlayer(validatedData.gameId, validatedData.playerId, req.user!.id);
      
      if (!player) {
        // Fetch from external API and create new player
        const apiData = await fetchPlayerDataFromAPI(validatedData.gameId, validatedData.playerId, validatedData.region);
        
        if (!apiData) {
          return res.status(404).json({ 
            message: "Player not found. Please check the player ID and region." 
          });
        }

        // Create player record
        player = await storage.createPlayer({
          userId: req.user!.id,
          gameId: validatedData.gameId,
          playerId: validatedData.playerId,
          username: apiData.username,
          region: validatedData.region || null,
          level: apiData.level,
          rank: apiData.rank,
          profileData: apiData.profileData,
        });

        // Create game stats
        await storage.createGameStats({
          playerId: player.id,
          winRate: apiData.winRate,
          averageKda: apiData.averageKda,
          totalPlaytime: apiData.totalPlaytime,
          currentLp: apiData.currentLp,
          statsData: apiData.statsData,
        });

        // Create recent matches
        if (apiData.recentMatches) {
          for (const matchData of apiData.recentMatches) {
            await storage.createMatch({
              playerId: player.id,
              matchId: matchData.matchId,
              gameMode: matchData.gameMode,
              result: matchData.result,
              duration: matchData.duration,
              champion: matchData.champion,
              kda: matchData.kda,
              cs: matchData.cs,
              lpChange: matchData.lpChange,
              matchData: matchData.matchData,
              playedAt: matchData.playedAt,
            });
          }
        }
      }

      // Get all related data
      const stats = await storage.getGameStats(player.id);
      const recentMatches = await storage.getMatches(player.id);

      const analytics: PlayerAnalytics = {
        player,
        stats: stats!,
        recentMatches,
        championStats: generateChampionStats(recentMatches),
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching player data:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request parameters",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to fetch player data. Please try again later." 
      });
    }
  });

  // Refresh player data
  app.post("/api/player/:gameId/:playerId/refresh", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { gameId, playerId } = req.params;
      const { region } = req.body;

      const player = await storage.getPlayer(gameId as GameType, playerId, req.user!.id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Fetch fresh data from API
      const apiData = await fetchPlayerDataFromAPI(gameId as GameType, playerId, region);
      if (!apiData) {
        return res.status(404).json({ message: "Unable to refresh player data" });
      }

      // Update player and stats
      await storage.updatePlayer(player.id, {
        level: apiData.level,
        rank: apiData.rank,
        profileData: apiData.profileData,
      });

      await storage.updateGameStats(player.id, {
        winRate: apiData.winRate,
        averageKda: apiData.averageKda,
        totalPlaytime: apiData.totalPlaytime,
        currentLp: apiData.currentLp,
        statsData: apiData.statsData,
      });

      res.json({ message: "Player data refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing player data:", error);
      res.status(500).json({ message: "Failed to refresh player data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// API integration functions
async function fetchPlayerDataFromAPI(gameId: GameType, playerId: string, region?: string) {
  try {
    switch (gameId) {
      case "lol":
        return await fetchLeagueOfLegendsData(playerId, region || "na1");
      case "steam":
        return await fetchSteamData(playerId);
      case "valorant":
        return await fetchValorantData(playerId, region || "na");
      case "cs2":
        return await fetchCS2Data(playerId);
      case "dota2":
        return await fetchDota2Data(playerId);
      case "clashroyale":
        return await fetchClashRoyaleData(playerId);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching ${gameId} data:`, error);
    return null;
  }
}

async function fetchLeagueOfLegendsData(summonerName: string, region: string) {
  const RIOT_API_KEY = process.env.RIOT_API_KEY || process.env.VITE_RIOT_API_KEY;
  if (!RIOT_API_KEY) {
    console.error("Riot API key not found");
    return null;
  }

  try {
    // Get summoner data
    const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    const summonerResponse = await fetch(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    if (!summonerResponse.ok) {
      return null;
    }

    const summoner = await summonerResponse.json();

    // Get ranked data
    const rankedUrl = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`;
    const rankedResponse = await fetch(rankedUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    const rankedData = await rankedResponse.json();
    const soloQueue = rankedData.find((entry: any) => entry.queueType === "RANKED_SOLO_5x5");

    // Get match history
    const matchesUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${summoner.puuid}/ids?count=10`;
    const matchesResponse = await fetch(matchesUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    const matchIds = await matchesResponse.json();
    const recentMatches = [];

    // Fetch match details
    for (const matchId of matchIds.slice(0, 5)) {
      const matchUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;
      const matchResponse = await fetch(matchUrl, {
        headers: { 'X-Riot-Token': RIOT_API_KEY }
      });

      if (matchResponse.ok) {
        const matchData = await matchResponse.json();
        const participant = matchData.info.participants.find((p: any) => p.puuid === summoner.puuid);

        if (participant) {
          recentMatches.push({
            matchId,
            gameMode: "Ranked Solo",
            result: participant.win ? "victory" : "defeat",
            duration: Math.floor(matchData.info.gameDuration / 60),
            champion: participant.championName,
            kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
            cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
            lpChange: participant.win ? Math.floor(Math.random() * 20) + 15 : -(Math.floor(Math.random() * 20) + 10),
            matchData: { participant, matchInfo: matchData.info },
            playedAt: new Date(matchData.info.gameStartTimestamp),
          });
        }
      }
    }

    // Calculate stats
    const wins = recentMatches.filter(m => m.result === "victory").length;
    const winRate = recentMatches.length > 0 ? Math.round((wins / recentMatches.length) * 100) : 0;

    return {
      username: summoner.name,
      level: summoner.summonerLevel,
      rank: soloQueue ? `${soloQueue.tier} ${soloQueue.rank}` : "Unranked",
      winRate,
      averageKda: "2.1",
      totalPlaytime: Math.floor(Math.random() * 100) + 50,
      currentLp: soloQueue?.leaguePoints || 0,
      profileData: { summoner, rankedData },
      statsData: { soloQueue },
      recentMatches,
    };
  } catch (error) {
    console.error("Error fetching League data:", error);
    return null;
  }
}

async function fetchSteamData(steamId: string) {
  const STEAM_API_KEY = process.env.STEAM_API_KEY || process.env.VITE_STEAM_API_KEY;
  if (!STEAM_API_KEY) {
    console.error("Steam API key not found");
    return null;
  }

  try {
    // Get player summary
    const playerUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;
    const playerResponse = await fetch(playerUrl);
    
    if (!playerResponse.ok) {
      return null;
    }

    const playerData = await playerResponse.json();
    const player = playerData.response.players[0];

    if (!player) {
      return null;
    }

    return {
      username: player.personaname,
      level: Math.floor(Math.random() * 100) + 1,
      rank: "Steam Level " + (Math.floor(Math.random() * 50) + 1),
      winRate: Math.floor(Math.random() * 40) + 60,
      averageKda: "1.8",
      totalPlaytime: Math.floor(Math.random() * 500) + 100,
      currentLp: 0,
      profileData: { player },
      statsData: {},
      recentMatches: [],
    };
  } catch (error) {
    console.error("Error fetching Steam data:", error);
    return null;
  }
}

async function fetchValorantData(playerName: string, region: string) {
  // Valorant API implementation would go here
  // For now, return mock structure
  return {
    username: playerName,
    level: Math.floor(Math.random() * 100) + 1,
    rank: "Diamond 2",
    winRate: Math.floor(Math.random() * 30) + 65,
    averageKda: "1.6",
    totalPlaytime: Math.floor(Math.random() * 200) + 50,
    currentLp: Math.floor(Math.random() * 100),
    profileData: {},
    statsData: {},
    recentMatches: [],
  };
}

async function fetchCS2Data(steamId: string) {
  // CS2 API implementation would go here
  return {
    username: "CS2Player",
    level: Math.floor(Math.random() * 40) + 1,
    rank: "Legendary Eagle",
    winRate: Math.floor(Math.random() * 25) + 60,
    averageKda: "1.4",
    totalPlaytime: Math.floor(Math.random() * 300) + 100,
    currentLp: 0,
    profileData: {},
    statsData: {},
    recentMatches: [],
  };
}

async function fetchDota2Data(steamId: string) {
  // Dota 2 API implementation would go here
  return {
    username: "DotaPlayer",
    level: Math.floor(Math.random() * 50) + 1,
    rank: "Ancient V",
    winRate: Math.floor(Math.random() * 35) + 55,
    averageKda: "2.3",
    totalPlaytime: Math.floor(Math.random() * 400) + 150,
    currentLp: Math.floor(Math.random() * 1000) + 3000,
    profileData: {},
    statsData: {},
    recentMatches: [],
  };
}

async function fetchClashRoyaleData(playerTag: string) {
  const CLASH_ROYALE_API_KEY = process.env.CLASH_ROYALE_API_KEY || process.env.VITE_CLASH_ROYALE_API_KEY;
  if (!CLASH_ROYALE_API_KEY) {
    console.error("Clash Royale API key not found");
    return null;
  }

  try {
    // Remove # if present and ensure proper tag format
    const cleanTag = playerTag.replace('#', '').toUpperCase();
    
    // Get player data
    const playerUrl = `https://api.clashroyale.com/v1/players/%23${cleanTag}`;
    const playerResponse = await fetch(playerUrl, {
      headers: { 'Authorization': `Bearer ${CLASH_ROYALE_API_KEY}` }
    });

    if (!playerResponse.ok) {
      return null;
    }

    const player = await playerResponse.json();

    // Get battle log
    const battleUrl = `https://api.clashroyale.com/v1/players/%23${cleanTag}/battlelog`;
    const battleResponse = await fetch(battleUrl, {
      headers: { 'Authorization': `Bearer ${CLASH_ROYALE_API_KEY}` }
    });

    const battleLog = battleResponse.ok ? await battleResponse.json() : [];
    const recentMatches = [];

    // Process recent battles
    if (battleLog && battleLog.length > 0) {
      for (const battle of battleLog.slice(0, 5)) {
        const isWin = battle.team && battle.opponent && 
          battle.team[0].crowns > battle.opponent[0].crowns;
        
        recentMatches.push({
          matchId: `${battle.battleTime}_${cleanTag}`,
          gameMode: battle.type || "1v1",
          result: isWin ? "victory" : "defeat",
          duration: Math.floor(Math.random() * 180) + 120, // 2-5 minutes typical
          champion: battle.team && battle.team[0].cards ? 
            battle.team[0].cards[0].name : "Unknown",
          kda: `${battle.team ? battle.team[0].crowns : 0}/${battle.opponent ? battle.opponent[0].crowns : 0}/0`,
          cs: 0, // Not applicable for Clash Royale
          lpChange: isWin ? Math.floor(Math.random() * 30) + 10 : -(Math.floor(Math.random() * 30) + 10),
          matchData: { battle },
          playedAt: new Date(battle.battleTime),
        });
      }
    }

    // Calculate win rate from recent battles
    const wins = recentMatches.filter(m => m.result === "victory").length;
    const winRate = recentMatches.length > 0 ? Math.round((wins / recentMatches.length) * 100) : 0;

    return {
      username: player.name,
      level: player.expLevel,
      rank: player.arena ? player.arena.name : "Unranked",
      winRate,
      averageKda: "1.8", // Not directly applicable, using placeholder
      totalPlaytime: Math.floor(Math.random() * 200) + 50,
      currentLp: player.trophies,
      profileData: { player },
      statsData: { arena: player.arena, clan: player.clan },
      recentMatches,
    };
  } catch (error) {
    console.error("Error fetching Clash Royale data:", error);
    return null;
  }
}

function generateChampionStats(matches: any[]) {
  const championMap = new Map();
  
  matches.forEach(match => {
    if (match.champion) {
      const existing = championMap.get(match.champion) || { wins: 0, total: 0 };
      existing.total++;
      if (match.result === "victory") {
        existing.wins++;
      }
      championMap.set(match.champion, existing);
    }
  });

  return Array.from(championMap.entries())
    .map(([name, stats]) => ({
      name,
      role: getChampionRole(name),
      winRate: Math.round((stats.wins / stats.total) * 100),
      games: stats.total,
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 5);
}

function getChampionRole(championName: string): string {
  const roles = ["ADC", "Support", "Mid", "Jungle", "Top"];
  return roles[Math.floor(Math.random() * roles.length)];
}
