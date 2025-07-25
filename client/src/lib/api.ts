import { GameType, PlayerAnalytics } from "@shared/schema";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchPlayerAnalytics(
  gameId: GameType,
  playerId: string,
  region?: string
): Promise<PlayerAnalytics> {
  const url = `/api/player/${gameId}/${encodeURIComponent(playerId)}${region ? `?region=${region}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function refreshPlayerData(
  gameId: GameType,
  playerId: string,
  region?: string
): Promise<void> {
  const url = `/api/player/${gameId}/${encodeURIComponent(playerId)}/refresh`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ region }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }
}
