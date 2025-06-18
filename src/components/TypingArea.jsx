import React, { useState, useEffect, useRef } from 'react';

const TypingArea = ({ text, gameStarted, onProgress, disabled }) => {
  const [userInput, setUserInput] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef(null);

  useEffect(() => {
    if (gameStarted && !startTime) {
      setStartTime(Date.now());
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [gameStarted, startTime]);

  useEffect(() => {
    if (!gameStarted) {
      setUserInput('');
      setCurrentPosition(0);
      setCorrectChars(0);
      setTotalChars(0);
      setStartTime(null);
      setWpm(0);
      setAccuracy(100);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (startTime && totalChars > 0) {
      const timeElapsed = (Date.now() - startTime) / 1000; // seconds
      const calculatedWpm = Math.round((correctChars / 5) / (timeElapsed / 60));
      const calculatedAccuracy = Math.round((correctChars / totalChars) * 100);
      
      setWpm(calculatedWpm || 0);
      setAccuracy(calculatedAccuracy || 0);

      // Send progress to parent component
      onProgress({
        currentPosition,
        correctChars,
        totalChars,
        wpm: calculatedWpm || 0,
        accuracy: calculatedAccuracy || 0
      });
    }
  }, [currentPosition, correctChars, totalChars, startTime, onProgress]);

  const handleInputChange = (e) => {
    if (disabled || !gameStarted) return;

    const value = e.target.value;
    setUserInput(value);

    // Calculate progress
    const inputLength = value.length;
    let correct = 0;
    
    for (let i = 0; i < inputLength && i < text.length; i++) {
      if (value[i] === text[i]) {
        correct++;
      }
    }

    setCurrentPosition(inputLength);
    setCorrectChars(correct);
    setTotalChars(inputLength);
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-lg ';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += 'bg-green-500/30 text-green-300'; // Correct character
        } else {
          className += 'bg-red-500/30 text-red-300'; // Incorrect character
        }
      } else if (index === userInput.length) {
        className += 'bg-blue-500/50 text-white'; // Current character
      } else {
        className += 'text-white/60'; // Untyped character
      }

      return (
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  const progress = text.length > 0 ? Math.round((currentPosition / text.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
          <div className="text-2xl font-bold text-white">{wpm}</div>
          <div className="text-white/70 text-sm">WPM</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
          <div className="text-2xl font-bold text-white">{accuracy}%</div>
          <div className="text-white/70 text-sm">Accuracy</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
          <div className="text-2xl font-bold text-white">{progress}%</div>
          <div className="text-white/70 text-sm">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Text Display */}
      <div className="bg-white/10 rounded-lg p-6 border border-white/20 min-h-[200px]">
        <div className="font-mono text-lg leading-relaxed break-words">
          {renderText()}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <label className="block text-white/80 text-sm font-medium">
          {gameStarted ? 'Type the text above:' : 'Waiting for game to start...'}
        </label>
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={disabled || !gameStarted}
          placeholder={gameStarted ? "Start typing..." : "Game will start soon..."}
          className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm resize-none font-mono"
          spellCheck={false}
        />
      </div>

      {/* Instructions */}
      <div className="text-center text-white/60 text-sm">
        {gameStarted 
          ? "Type the text exactly as shown above. Correct characters will be highlighted in green."
          : "Wait for the game to start, then type as fast and accurately as possible!"
        }
      </div>
    </div>
  );
};

export default TypingArea;