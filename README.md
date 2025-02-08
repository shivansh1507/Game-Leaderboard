# Game Leaderboard System

A real-time game leaderboard system with contestant management, game sessions, and popularity tracking.

## Features

- Contestant management (CRUD operations)
- Game management with real-time sessions
- Global and game-specific leaderboards
- Dynamic game popularity scoring
- Historical game data tracking

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Supabase:
   - Create a new Supabase project
   - Click "Connect to Supabase" button in the top right
   - The environment variables will be automatically configured

4. Run the development server:
   ```bash
   npm run dev
   ```


[LIVEDEMO](https://game-leaderboard-six.vercel.app/)


## Demo Steps





Follow these steps to test all functionality:

1. Create Games:
   - Navigate to the Games page
   - Create at least 5 different games using the "Add Game" button
   - Example games: "Chess", "Tetris", "Snake", "Pong", "Space Invaders"

2. Add Contestants:
   - Go to the Contestants page
   - Add multiple contestants with different names and emails
   - Example: "John Doe", "Jane Smith", "Alice Johnson"

3. Start Game Sessions:
   - Navigate to the Games page
   - Click "Start Session" for different games
   - Add contestants to active sessions
   - Assign different scores to contestants

4. View Leaderboards:
   - Check the Global Leaderboard to see all-time high scores
   - View game-specific leaderboards by selecting a game
   - Filter leaderboards by date

5. Check Game Popularity:
   - View the Popularity page
   - Note the current popularity scores
   - Wait 6 minutes
   - Refresh to see updated popularity scores based on recent activity

## Architecture

The system uses:
- React for the frontend
- Supabase for the backend database
- Real-time subscriptions for live updates
- Scheduled tasks for popularity score updates

## API Endpoints

The system provides the following main API endpoints through Supabase:

- `/contestants` - Contestant management
- `/games` - Game management
- `/game-sessions` - Active session management
- `/game-history` - Historical game data
- `/leaderboard` - Leaderboard queries
- `/popularity` - Game popularity calculations

## Data Model

- Contestants: Basic user information
- Games: Game details and metadata
- GameSessions: Active game tracking
- GameHistory: Completed game records

## Security

- Row Level Security (RLS) enabled
- Public read access for leaderboards
- Protected write operations
- Rate limiting on API endpoints
