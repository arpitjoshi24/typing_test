import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TypingArea from './TypingArea';
import Leaderboard from './Leaderboard';

const Room = ({ roomId, username }) => {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [gameState, setGameState] = useState('waiting');
  const [text, setText] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('join-room', { roomId, username });

    newSocket.on('room-joined', (data) => {
      setText(data.text);
      setGameState(data.gameState);
      setUsers(data.users);
      const user = data.users.find(u => u.id === newSocket.id);
      setCurrentUser(user);
    });

    newSocket.on('users-updated', (updatedUsers) => {
      setUsers(updatedUsers);
      const user = updatedUsers.find(u => u.id === newSocket.id);
      setCurrentUser(user);
    });

    newSocket.on('game-started', (data) => {
      setText(data.text);
      setGameState('playing');
      setGameStarted(true);
      setGameFinished(false);
    });

    newSocket.on('game-reset', (data) => {
      setText(data.text);
      setUsers(data.users);
      setGameState('waiting');
      setGameStarted(false);
      setGameFinished(false);
      const user = data.users.find(u => u.id === newSocket.id);
      setCurrentUser(user);
    });

    newSocket.on('typing-finished', (data) => {
      setGameFinished(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, username]);

  const handleStartGame = () => {
    if (socket) {
      socket.emit('start-game');
    }
  };

  const handleResetGame = () => {
    if (socket) {
      socket.emit('reset-game');
    }
  };

  const handleTypingProgress = (progressData) => {
    if (socket && gameState === 'playing') {
      socket.emit('typing-progress', progressData);
    }
  };

  const allUsersFinished = users.length > 0 && users.every(user => user.finished);
  const sortedUsers = [...users].sort((a, b) => {
    if (a.finished && b.finished) {
      return b.wpm - a.wpm || b.accuracy - a.accuracy;
    }
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.progress - a.progress || b.wpm - a.wpm;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Room: {roomId}</h1>
          <p className="text-white/80">Welcome, {username}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="lg:order-2">
            <Leaderboard 
              users={sortedUsers} 
              currentUserId={currentUser?.id}
              gameState={gameState}
            />
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2 lg:order-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              {/* Game Controls */}
              <div className="flex flex-wrap gap-4 mb-6 justify-center">
                {gameState === 'waiting' && (
                  <button
                    onClick={handleStartGame}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Start Game
                  </button>
                )}
                
                {(gameState === 'playing' || allUsersFinished) && (
                  <button
                    onClick={handleResetGame}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Reset Game
                  </button>
                )}
              </div>

              {/* Game Status */}
              <div className="text-center mb-6">
                {gameState === 'waiting' && (
                  <p className="text-white/80 text-lg">
                    Waiting for game to start... ({users.length} player{users.length !== 1 ? 's' : ''} in room)
                  </p>
                )}
                
                {gameState === 'playing' && !gameFinished && (
                  <p className="text-white/80 text-lg">
                    Game in progress... Type as fast and accurately as possible!
                  </p>
                )}
                
                {gameFinished && (
                  <div className="text-center">
                    <p className="text-green-400 text-xl font-semibold mb-2">
                      🎉 You completed the test!
                    </p>
                    {currentUser && (
                      <div className="text-white/90">
                        <p>Your WPM: <span className="font-bold text-yellow-400">{currentUser.wpm}</span></p>
                        <p>Your Accuracy: <span className="font-bold text-yellow-400">{currentUser.accuracy}%</span></p>
                      </div>
                    )}
                  </div>
                )}
                
                {allUsersFinished && (
                  <p className="text-purple-400 text-lg font-semibold mt-4">
                    🏁 All players finished! Check the leaderboard for final results.
                  </p>
                )}
              </div>

              {/* Typing Area */}
              {text && (
                <TypingArea
                  text={text}
                  gameStarted={gameStarted && gameState === 'playing'}
                  onProgress={handleTypingProgress}
                  disabled={gameState !== 'playing' || gameFinished}
                />
              )}
            </div>
          </div>
        </div>

        {/* Room Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-lg rounded-lg px-6 py-3 border border-white/20">
            <div className="text-white/80">
              <span className="text-sm">Players: </span>
              <span className="font-semibold text-white">{users.length}</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="text-white/80">
              <span className="text-sm">Status: </span>
              <span className={`font-semibold ${
                gameState === 'waiting' ? 'text-yellow-400' : 
                gameState === 'playing' ? 'text-green-400' : 
                'text-blue-400'
              }`}>
                {gameState === 'waiting' ? 'Waiting' : 
                 gameState === 'playing' ? 'Playing' : 
                 'Finished'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;