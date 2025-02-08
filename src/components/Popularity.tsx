import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GamePopularity } from '../types';
import { TrendingUp, Star } from 'lucide-react';

export default function Popularity() {
  const [popularity, setPopularity] = useState<GamePopularity[]>([]);

  useEffect(() => {
    fetchPopularity();
    const interval = setInterval(fetchPopularity, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  async function fetchPopularity() {
    // Get statistics for popularity calculation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: games } = await supabase.from('games').select('*');
    if (!games) return;

    const popularityData: GamePopularity[] = await Promise.all(
      games.map(async (game) => {
        // Get yesterday's players
        const { count: dailyPlayers } = await supabase
          .from('game_history')
          .select('contestant_id', { count: 'exact' })
          .eq('game_id', game.id)
          .eq('played_date', yesterdayStr);

        // Get current players
        const { count: currentPlayers } = await supabase
          .from('game_sessions')
          .select('contestant_id', { count: 'exact' })
          .eq('game_id', game.id)
          .eq('is_active', true);

        // Get max session length from yesterday
        const { data: sessions } = await supabase
          .from('game_history')
          .select('session_length')
          .eq('game_id', game.id)
          .eq('played_date', yesterdayStr)
          .order('session_length', { ascending: false })
          .limit(1);

        // Get total sessions from yesterday
        const { count: totalSessions } = await supabase
          .from('game_history')
          .select('id', { count: 'exact' })
          .eq('game_id', game.id)
          .eq('played_date', yesterdayStr);

        // Get maximum values for normalization
        const { data: maxStats } = await supabase
          .from('games')
          .select('id')
          .order('upvotes', { ascending: false })
          .limit(1);

        const maxUpvotes = maxStats?.[0]?.upvotes || 1;
        const maxSessionLength = sessions?.[0]?.session_length || 1;
        const maxDailyPlayers = dailyPlayers || 1;
        const maxConcurrentPlayers = currentPlayers || 1;
        const maxDailySessions = totalSessions || 1;

        // Calculate popularity score
        const score = 
          0.3 * ((dailyPlayers || 0) / maxDailyPlayers) +
          0.2 * ((currentPlayers || 0) / maxConcurrentPlayers) +
          0.25 * (game.upvotes / maxUpvotes) +
          0.15 * ((sessions?.[0]?.session_length || 0) / maxSessionLength) +
          0.1 * ((totalSessions || 0) / maxDailySessions);

        return {
          game_id: game.id,
          game_name: game.name,
          popularity_score: score,
          daily_players: dailyPlayers || 0,
          current_players: currentPlayers || 0,
          upvotes: game.upvotes,
          max_session_length: sessions?.[0]?.session_length || 0,
          total_sessions: totalSessions || 0
        };
      })
    );

    setPopularity(popularityData.sort((a, b) => b.popularity_score - a.popularity_score));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Game Popularity</h1>
        <div className="text-sm text-gray-500">
          Updates every 5 minutes
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {popularity.map((game) => (
          <div key={game.game_id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{game.game_name}</h3>
              <TrendingUp className={`w-5 h-5 ${
                game.popularity_score > 0.7 ? 'text-green-500' :
                game.popularity_score > 0.4 ? 'text-yellow-500' :
                'text-gray-500'
              }`} />
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                      Popularity Score
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-indigo-600">
                      {(game.popularity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{ width: `${game.popularity_score * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  />
                </div>
              </div>
              <dl className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Daily Players</dt>
                  <dd className="text-sm font-medium text-gray-900">{game.daily_players}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Current Players</dt>
                  <dd className="text-sm font-medium text-gray-900">{game.current_players}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Upvotes</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      {game.upvotes}
                    </div>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Max Session Length</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {Math.round(game.max_session_length / 60000)}min
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Sessions</dt>
                  <dd className="text-sm font-medium text-gray-900">{game.total_sessions}</dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}