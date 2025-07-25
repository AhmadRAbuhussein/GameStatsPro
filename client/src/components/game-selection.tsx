import { GameType } from "@shared/schema";
import { Crown, Gamepad2, Target, Crosshair, Zap, Plus, Shield } from "lucide-react";

interface GameSelectionProps {
  onGameSelect: (gameId: GameType) => void;
}

const games = [
  {
    id: "lol" as GameType,
    name: "League of Legends",
    provider: "Riot Games API",
    description: "Track your ranked performance, champion mastery, and match history in the world's most popular MOBA.",
    icon: Crown,
    gradient: "from-blue-500 to-purple-600",
    available: true,
  },
  {
    id: "steam" as GameType,
    name: "Steam Games",
    provider: "Steam Web API",
    description: "Analyze your Steam profile, game achievements, playtime statistics, and library insights.",
    icon: Gamepad2,
    gradient: "from-indigo-500 to-blue-600",
    available: true,
  },
  {
    id: "valorant" as GameType,
    name: "Valorant",
    provider: "Riot Games API",
    description: "Track your competitive rank, agent performance, and shooting accuracy in Riot's tactical FPS.",
    icon: Target,
    gradient: "from-red-500 to-pink-600",
    available: true,
  },
  {
    id: "cs2" as GameType,
    name: "Counter-Strike 2",
    provider: "Steam API",
    description: "Analyze your competitive ranking, weapon statistics, and match performance in CS2.",
    icon: Crosshair,
    gradient: "from-orange-500 to-red-600",
    available: true,
  },
  {
    id: "dota2" as GameType,
    name: "Dota 2",
    provider: "Steam API",
    description: "Track your MMR, hero performance, and strategic insights in Valve's complex MOBA.",
    icon: Zap,
    gradient: "from-purple-500 to-indigo-600",
    available: true,
  },
  {
    id: "clashroyale" as GameType,
    name: "Clash Royale",
    provider: "Supercell API",
    description: "Analyze your trophy progression, deck performance, and battle statistics in this strategic card game.",
    icon: Shield,
    gradient: "from-amber-500 to-orange-600",
    available: true,
  },
];

export default function GameSelection({ onGameSelect }: GameSelectionProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h2 
          className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent"
          style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          data-testid="hero-title"
        >
          Analyze Your Gaming Performance
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto" data-testid="hero-description">
          Get detailed analytics for your favorite games. Track your progress, analyze your performance, and level up your gameplay.
        </p>
      </div>

      {/* Game Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="rounded-xl border p-6 hover:border-pink-400 transition-all duration-300 cursor-pointer group"
            style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
            onClick={() => game.available && onGameSelect(game.id)}
            data-testid={`card-game-${game.id}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${game.gradient} rounded-lg flex items-center justify-center`}>
                <game.icon className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-pink-400 transition-colors duration-200" data-testid={`text-game-name-${game.id}`}>
                  {game.name}
                </h3>
                <p className="text-gray-400" data-testid={`text-game-provider-${game.id}`}>{game.provider}</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4" data-testid={`text-game-description-${game.id}`}>{game.description}</p>
            <div className="flex items-center justify-between">
              {game.available ? (
                <span className="text-green-400 text-sm" data-testid={`status-available-${game.id}`}>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                  Available
                </span>
              ) : (
                <span className="text-gray-500 text-sm" data-testid={`status-coming-soon-${game.id}`}>
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
                  Coming Soon
                </span>
              )}
              {game.available && (
                <div className="text-pink-400 group-hover:translate-x-1 transition-transform duration-200">
                  →
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Coming Soon Card */}
        <div
          className="rounded-xl border p-6 opacity-60"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
          data-testid="card-more-games"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <Plus className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-400" data-testid="text-more-games-title">More Games</h3>
              <p className="text-gray-500" data-testid="text-more-games-status">Coming Soon</p>
            </div>
          </div>
          <p className="text-gray-500 mb-4" data-testid="text-more-games-description">
            Fortnite, Apex Legends, Overwatch 2, and more games will be added soon.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm" data-testid="status-more-games">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
