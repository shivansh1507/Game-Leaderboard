/*
  # Initial Schema Setup for Game Leaderboard System

  1. New Tables
    - `contestants`
      - Basic user information and management
    - `games`
      - Game information and upvotes
    - `game_sessions`
      - Tracks active game sessions and scores
    - `game_history`
      - Historical record of completed games

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create contestants table
CREATE TABLE IF NOT EXISTS contestants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  contestant_id uuid REFERENCES contestants(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_history table
CREATE TABLE IF NOT EXISTS game_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  contestant_id uuid REFERENCES contestants(id) ON DELETE CASCADE,
  score integer NOT NULL,
  session_length interval,
  played_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for contestants"
  ON contestants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for games"
  ON games FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for game_sessions"
  ON game_sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for game_history"
  ON game_history FOR SELECT
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_contestant_id ON game_sessions(contestant_id);
CREATE INDEX IF NOT EXISTS idx_game_history_game_id ON game_history(game_id);
CREATE INDEX IF NOT EXISTS idx_game_history_contestant_id ON game_history(contestant_id);
CREATE INDEX IF NOT EXISTS idx_game_history_played_date ON game_history(played_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contestants_updated_at
    BEFORE UPDATE ON contestants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();