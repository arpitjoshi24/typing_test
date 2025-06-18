import React, { useState } from 'react';
import Room from './components/Room';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      setJoined(true);
    }
  };

  if (joined) {
    return <Room roomId={roomId} username={username} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TypingRace</h1>
          <p className="text-white/80">Compete with friends in real-time typing challenges</p>
        </div>
        
        <form onSubmit={handleJoinRoom} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-white/90 mb-2">
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Enter room ID (e.g., room1)"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Join Room
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white font-semibold mb-2">How to play:</h3>
          <ul className="text-white/80 text-sm space-y-1">
            <li>• Enter a username and room ID</li>
            <li>• Wait for other players to join</li>
            <li>• Click "Start Game" to begin typing</li>
            <li>• Type as fast and accurately as possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;