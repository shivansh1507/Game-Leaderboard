import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Game, LeaderboardEntry } from '../types';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchGames();
    fetchLeaderboard();
  }, [selectedGame, selectedDate]);

  async function fetchGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('name');
    
    if (error) console.error('Error fetching games:', error);
    else setGames(data || []);
  }

  async function fetchLeaderboard() {
    let query = supabase
      .from('game_history')
      .select(`
        id,
        score,
        played_date,
        games (name),
        contestants (name)
      `)
      .order('score', { ascending: false });

    if (selectedGame) {
      query = query.eq('game_id', selectedGame);
    }

    if (selectedDate) {
      query = query.eq('played_date', selectedDate);
    }

    const { data, error } = await query;
    
    if (error) console.error('Error fetching leaderboard:', error);
    else {
      const entries = data.map(entry => ({
        contestant_name: entry.contestants.name,
        game_name: entry.games.name,
        score: entry.score,
        played_date: entry.played_date
      }));
      setLeaderboard(entries);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <div className="flex space-x-4">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Games</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <Trophy className="w-8 h-8 text-yellow-500 mb-4" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {selectedGame 
              ? `Leaderboard for ${games.find(g => g.id === selectedGame)?.name}`
              : 'Global Leaderboard'}
          </h3>
          {selectedDate && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Showing scores for {new Date(selectedDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index < 3 ? (
                    <Medal className={`w-5 h-5 ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      'text-yellow-700'
                    }`} />
                  ) : (
                    index + 1
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.contestant_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.game_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  {entry.score}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.played_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}