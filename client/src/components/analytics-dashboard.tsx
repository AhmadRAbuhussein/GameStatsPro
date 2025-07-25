import { PlayerAnalytics } from "@shared/schema";
import { Trophy, Sword, Clock, TrendingUp, ArrowRight, User } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsDashboardProps {
  analytics: PlayerAnalytics;
}

// Mock chart data - in a real implementation, this would come from the API
const mockChartData = [
  { week: 'Week 1', winRate: 65 },
  { week: 'Week 2', winRate: 59 },
  { week: 'Week 3', winRate: 70 },
  { week: 'Week 4', winRate: 81 },
  { week: 'Week 5', winRate: 68 },
  { week: 'Week 6', winRate: 74 },
];

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const { player, stats, recentMatches, championStats } = analytics;

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return 'Unknown';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-8">
      {/* Player Profile Header */}
      <div 
        className="rounded-xl border p-6"
        style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
      >
        <div className="flex items-center space-x-6">
          <div 
            className="w-20 h-20 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
          >
            <User className="text-white text-2xl" data-testid="avatar-player" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white" data-testid="text-username">{player.username}</h2>
            <p className="text-gray-400" data-testid="text-game-info">
              {player.gameId.toUpperCase()} {player.region && `- ${player.region.toUpperCase()}`}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: 'var(--gaming-accent)' }}
                data-testid="badge-rank"
              >
                {player.rank || 'Unranked'}
              </span>
              <span className="text-green-400 text-sm" data-testid="text-last-seen">
                Last seen: {formatTimeAgo(player.lastUpdated)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--gaming-pink)' }} data-testid="text-level">
              {player.level || 0}
            </p>
            <p className="text-gray-400 text-sm">Level</p>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="rounded-xl border p-6"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
            >
              <Trophy style={{ color: 'var(--gaming-success)' }} />
            </div>
            <span className="text-green-400 text-sm" data-testid="trend-win-rate">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-white" data-testid="stat-win-rate">
            {stats?.winRate || 0}%
          </h3>
          <p className="text-gray-400 text-sm">Win Rate</p>
        </div>

        <div 
          className="rounded-xl border p-6"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(15, 52, 96, 0.2)' }}
            >
              <Sword style={{ color: 'var(--gaming-blue)' }} />
            </div>
            <span className="text-green-400 text-sm" data-testid="trend-kda">+0.2</span>
          </div>
          <h3 className="text-2xl font-bold text-white" data-testid="stat-kda">
            {stats?.averageKda || '0.0'}
          </h3>
          <p className="text-gray-400 text-sm">Average KDA</p>
        </div>

        <div 
          className="rounded-xl border p-6"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(233, 69, 96, 0.2)' }}
            >
              <Clock style={{ color: 'var(--gaming-pink)' }} />
            </div>
            <span className="text-gray-300 text-sm">This week</span>
          </div>
          <h3 className="text-2xl font-bold text-white" data-testid="stat-playtime">
            {stats?.totalPlaytime || 0}h
          </h3>
          <p className="text-gray-400 text-sm">Playtime</p>
        </div>

        <div 
          className="rounded-xl border p-6"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}
            >
              <TrendingUp style={{ color: 'var(--gaming-warning)' }} />
            </div>
            <span style={{ color: 'var(--gaming-warning)' }} className="text-sm" data-testid="trend-lp">
              +{Math.floor(Math.random() * 100) + 50} LP
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white" data-testid="stat-lp">
            {stats?.currentLp || 0}
          </h3>
          <p className="text-gray-400 text-sm">LP</p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate Trend */}
        <div 
          className="rounded-xl border p-6"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          <h3 className="text-xl font-semibold text-white mb-4" data-testid="chart-title-win-rate">Win Rate Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="week" stroke="#B8B8B8" />
                <YAxis domain={[0, 100]} stroke="#B8B8B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--gaming-dark)', 
                    border: '1px solid var(--gaming-accent)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="winRate" 
                  stroke="var(--gaming-pink)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--gaming-pink)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Champions */}
        <div 
          className="rounded-xl border p-6"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          <h3 className="text-xl font-semibold text-white mb-4" data-testid="section-title-champions">Top Champions</h3>
          <div className="space-y-4">
            {championStats && championStats.length > 0 ? (
              championStats.map((champion, index) => (
                <div 
                  key={champion.name}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--gaming-dark)' }}
                  data-testid={`champion-card-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--gaming-accent)' }}
                    >
                      <span className="text-white font-bold" data-testid={`champion-icon-${index}`}>
                        {champion.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white" data-testid={`champion-name-${index}`}>
                        {champion.name}
                      </p>
                      <p className="text-sm text-gray-400" data-testid={`champion-role-${index}`}>
                        {champion.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400" data-testid={`champion-winrate-${index}`}>
                      {champion.winRate}%
                    </p>
                    <p className="text-sm text-gray-400" data-testid={`champion-games-${index}`}>
                      {champion.games} games
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400" data-testid="no-champion-data">No champion data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Match History */}
      <div 
        className="rounded-xl border p-6"
        style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white" data-testid="section-title-matches">Recent Matches</h3>
          <button 
            className="transition-colors duration-200 flex items-center"
            style={{ color: 'var(--gaming-pink)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gaming-blue)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gaming-pink)'; }}
            data-testid="button-view-all-matches"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {recentMatches && recentMatches.length > 0 ? (
            recentMatches.map((match, index) => (
              <div 
                key={match.id}
                className="rounded-lg p-4 border-l-4"
                style={{ 
                  backgroundColor: 'var(--gaming-dark)',
                  borderLeftColor: match.result === 'victory' ? 'var(--gaming-success)' : 'var(--gaming-error)'
                }}
                data-testid={`match-card-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                        style={{ backgroundColor: 'var(--gaming-accent)' }}
                      >
                        <span className="text-white font-bold" data-testid={`match-champion-icon-${index}`}>
                          {match.champion?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400" data-testid={`match-champion-${index}`}>
                        {match.champion || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span 
                          className={`font-semibold ${match.result === 'victory' ? 'text-green-400' : 'text-red-400'}`}
                          data-testid={`match-result-${index}`}
                        >
                          {match.result === 'victory' ? 'Victory' : 'Defeat'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400" data-testid={`match-duration-${index}`}>
                          {formatDuration(match.duration || 0)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span data-testid={`match-kda-${index}`}>{match.kda || '0/0/0'}</span>
                        <span data-testid={`match-cs-${index}`}>{match.cs || 0} CS</span>
                        <span data-testid={`match-mode-${index}`}>{match.gameMode || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p 
                      className={`font-semibold ${match.lpChange && match.lpChange > 0 ? 'text-green-400' : 'text-red-400'}`}
                      data-testid={`match-lp-${index}`}
                    >
                      {match.lpChange ? (match.lpChange > 0 ? `+${match.lpChange}` : match.lpChange) : '0'} LP
                    </p>
                    <p className="text-xs text-gray-400" data-testid={`match-time-${index}`}>
                      {formatTimeAgo(match.playedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400" data-testid="no-match-data">No recent matches found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
