import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TowerControl as GameController, Users, Trophy, TrendingUp } from 'lucide-react';
import Games from './components/Games';
import Contestants from './components/Contestants';
import Leaderboard from './components/Leaderboard';
import Popularity from './components/Popularity';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link
                  to="/games"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  <GameController className="w-5 h-5 mr-2" />
                  Games
                </Link>
                <Link
                  to="/contestants"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Contestants
                </Link>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Leaderboard
                </Link>
                <Link
                  to="/popularity"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Popularity
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/games" element={<Games />} />
            <Route path="/contestants" element={<Contestants />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/popularity" element={<Popularity />} />
            <Route path="/" element={<Games />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;