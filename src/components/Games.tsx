import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Game, GameSession } from '../types';
import { Plus, ThumbsUp, Play, Pause, X } from 'lucide-react';

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [newGame, setNewGame] = useState({ name: '', description: '' });
  const [showNewGame, setShowNewGame] = useState(false);

  useEffect(() => {
    fetchGames();
    fetchSessions();
  }, []);

  async function fetchGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching games:', error);
    else setGames(data || []);
  }

  async function fetchSessions() {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('is_active', true);
    
    if (error) console.error('Error fetching sessions:', error);
    else setSessions(data || []);
  }

  async function createGame(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from('games')
      .insert([newGame]);
    
    if (error) console.error('Error creating game:', error);
    else {
      setNewGame({ name: '', description: '' });
      setShowNewGame(false);
      fetchGames();
    }
  }

  async function upvoteGame(gameId: string) {
    const { error } = await supabase
      .from('games')
      .update({ upvotes: games.find(g => g.id === gameId)!.upvotes + 1 })
      .eq('id', gameId);
    
    if (error) console.error('Error upvoting game:', error);
    else fetchGames();
  }

  async function startSession(gameId: string) {
    const { error } = await supabase
      .from('game_sessions')
      .insert([{ game_id: gameId }]);
    
    if (error) console.error('Error starting session:', error);
    else fetchSessions();
  }

  async function endSession(sessionId: string) {
    const { error } = await supabase
      .from('game_sessions')
      .update({ 
        is_active: false,
        end_time: new Date().toISOString()
      })
      .eq('id', sessionId);
    
    if (error) console.error('Error ending session:', error);
    else {
      // Move to history
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        await supabase
          .from('game_history')
          .insert([{
            game_id: session.game_id,
            contestant_id: session.contestant_id,
            score: session.score,
            session_length: new Date(session.end_time!).getTime() - new Date(session.start_time).getTime()
          }]);
      }
      fetchSessions();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Games</h1>
        <button
          onClick={() => setShowNewGame(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Game
        </button>
      </div>

      {showNewGame && (
        <form onSubmit={createGame} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={newGame.name}
                onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={newGame.description}
                onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewGame(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div key={game.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{game.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{game.description}</p>
              </div>
              <button
                onClick={() => upvoteGame(game.id)}
                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {game.upvotes}
              </button>
            </div>
            <div className="mt-4">
              {sessions.some(s => s.game_id === game.id) ? (
                <button
                  onClick={() => endSession(sessions.find(s => s.game_id === game.id)!.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 w-full justify-center"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  End Session
                </button>
              ) : (
                <button
                  onClick={() => startSession(game.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 w-full justify-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}