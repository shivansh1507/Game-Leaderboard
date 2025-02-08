export interface Contestant {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  game_id: string;
  contestant_id: string;
  score: number;
  start_time: string;
  end_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameHistory {
  id: string;
  game_id: string;
  contestant_id: string;
  score: number;
  session_length: string;
  played_date: string;
  created_at: string;
}

export interface LeaderboardEntry {
  contestant_name: string;
  game_name: string;
  score: number;
  played_date: string;
}

export interface GamePopularity {
  game_id: string;
  game_name: string;
  popularity_score: number;
  daily_players: number;
  current_players: number;
  upvotes: number;
  max_session_length: number;
  total_sessions: number;
}