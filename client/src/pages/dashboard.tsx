import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { PlayerAnalytics } from "@shared/schema";
import { Gamepad2, Bell, ArrowLeft, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:gameId/:playerId");
  const { user, logout } = useAuth();
  
  if (!match) return null;
  
  const { gameId, playerId } = params;
  const searchParams = new URLSearchParams(window.location.search);
  const region = searchParams.get("region");

  const { data: analytics, isLoading, error } = useQuery<PlayerAnalytics>({
    queryKey: ["/api/player", gameId, playerId, region],
    enabled: !!gameId && !!playerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gaming-dark)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gaming-dark)' }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--gaming-error)' }}>
            <span className="text-white text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-white" data-testid="error-title">Player Not Found</h2>
          <p className="text-gray-400 max-w-md" data-testid="error-message">
            We couldn't find the player "{playerId}". Please check the player ID and region, then try again.
          </p>
          <Link href="/">
            <button 
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
              data-testid="button-back-home"
            >
              <ArrowLeft className="inline mr-2 h-4 w-4" />
              Back to Game Selection
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gaming-dark)' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
                  data-testid="logo-link"
                >
                  <Gamepad2 className="text-white text-xl" />
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-white" data-testid="app-title">GameStats</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-300 hover:text-pink-400 transition-colors duration-200" data-testid="nav-dashboard">Dashboard</Link>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-200" data-testid="nav-analytics">Analytics</a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-200" data-testid="nav-profile">Profile</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200" data-testid="button-notifications">
                <Bell />
              </button>
              <span className="text-gray-300 text-sm" data-testid="user-phone">
                {user?.phone}
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
        <AnalyticsDashboard analytics={analytics} />
      </main>
    </div>
  );
}
