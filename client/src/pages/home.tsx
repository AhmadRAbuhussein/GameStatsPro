import { useState } from "react";
import { useLocation } from "wouter";
import GameSelection from "@/components/game-selection";
import PlayerInput from "@/components/player-input";
import { GameType } from "@shared/schema";
import { Gamepad2, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleGameSelect = (gameId: GameType) => {
    setSelectedGame(gameId);
  };

  const handlePlayerSubmit = (playerId: string, region?: string) => {
    if (selectedGame) {
      const path = `/dashboard/${selectedGame}/${encodeURIComponent(playerId)}${region ? `?region=${region}` : ''}`;
      setLocation(path);
    }
  };

  const handleBack = () => {
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gaming-dark)' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
              >
                <Gamepad2 className="text-white text-xl" data-testid="logo-icon" />
              </div>
              <h1 className="text-2xl font-bold text-white" data-testid="app-title">GameStats</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-200" data-testid="nav-dashboard">Dashboard</a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-200" data-testid="nav-analytics">Analytics</a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-200" data-testid="nav-profile">Profile</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200" data-testid="button-notifications">
                <Bell />
              </button>
              <span className="text-gray-300 text-sm" data-testid="user-email">
                {user?.email}
              </span>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200" 
                data-testid="button-logout"
                title="Logout"
              >
                <LogOut />
              </button>
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: 'var(--gaming-pink)' }}
                data-testid="avatar-user"
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedGame ? (
          <GameSelection onGameSelect={handleGameSelect} />
        ) : (
          <PlayerInput 
            selectedGame={selectedGame}
            onSubmit={handlePlayerSubmit}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
              >
                <Gamepad2 className="text-white" />
              </div>
              <span className="text-gray-400" data-testid="footer-copyright">© 2025 GameStats Analytics</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-200" data-testid="link-privacy">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-200" data-testid="link-terms">Terms</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-200" data-testid="link-support">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
