import React from 'react';

const Leaderboard = ({ users, currentUserId, gameState }) => {
  if (!users || users.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Leaderboard</h2>
        <div className="text-center text-white/60">
          <p>No players in room yet</p>
        </div>
      </div>
    );
  }

  // Sort users for leaderboard display
  const sortedUsers = [...users].sort((a, b) => {
    // If game is finished, sort by completion status first, then WPM, then accuracy
    if (gameState === 'playing' || gameState === 'finished') {
      if (a.finished && b.finished) {
        // Both finished - sort by WPM, then accuracy
        if (a.wpm !== b.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy;
      }
      if (a.finished && !b.finished) return -1; // Finished users first
      if (!a.finished && b.finished) return 1;
      
      // Both still playing - sort by progress, then WPM
      if (a.progress !== b.progress) return b.progress - a.progress;
      return b.wpm - a.wpm;
    }
    
    // Game not started - just sort alphabetically
    return a.username.localeCompare(b.username);
  });

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getStatusIcon = (user) => {
    if (user.finished) return '✅';
    if (gameState === 'playing' && user.progress > 0) return '⚡';
    return '⏳';
  };

  const getProgressBarColor = (user, index) => {
    if (user.finished) {
      if (index === 0) return 'from-yellow-400 to-orange-400'; // Gold
      if (index === 1) return 'from-gray-300 to-gray-400'; // Silver
      if (index === 2) return 'from-orange-300 to-orange-500'; // Bronze
      return 'from-green-400 to-green-500'; // Completed
    }
    return 'from-blue-400 to-purple-500'; // In progress
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 h-fit">
      <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
        🏆 Leaderboard
      </h2>
      
      <div className="space-y-3">
        {sortedUsers.map((user, index) => (
          <div
            key={user.id}
            className={`relative bg-white/10 rounded-lg p-4 border transition-all duration-200 ${
              user.id === currentUserId 
                ? 'border-yellow-400/50 bg-yellow-400/10 shadow-lg transform scale-105' 
                : 'border-white/20 hover:border-white/30'
            }`}
          >
            {/* User is you indicator */}
            {user.id === currentUserId && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                YOU
              </div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-white">
                  {getRankIcon(index)}
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    {user.username}
                    <span className="text-lg">{getStatusIcon(user)}</span>
                  </div>
                  <div className="text-white/60 text-sm">
                    {user.finished ? 'Completed' : `${user.progress}% complete`}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-bold text-lg">
                  {user.wpm} <span className="text-sm font-normal text-white/70">WPM</span>
                </div>
                <div className="text-white/80 text-sm">
                  {user.accuracy}% accuracy
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarColor(user, index)} transition-all duration-500`}
                style={{ width: `${user.progress}%` }}
              ></div>
            </div>
            
            {/* Additional Stats */}
            <div className="flex justify-between text-xs text-white/60">
              <span>Position: {user.currentPosition} chars</span>
              <span>Correct: {user.correctChars}/{user.totalChars}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Game State Info */}
      <div className="mt-6 text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          gameState === 'waiting' ? 'bg-yellow-500/20 text-yellow-300' :
          gameState === 'playing' ? 'bg-green-500/20 text-green-300' :
          'bg-blue-500/20 text-blue-300'
        }`}>
          {gameState === 'waiting' && '⏳ Waiting to start'}
          {gameState === 'playing' && '🏃 Game in progress'}
          {gameState === 'finished' && '🏁 Game finished'}
        </div>
      </div>
      
      {/* Summary Stats */}
      {users.length > 0 && gameState === 'playing' && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-center text-white/70 text-sm">
            <div>Active Players: {users.length}</div>
            <div>Finished: {users.filter(u => u.finished).length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;