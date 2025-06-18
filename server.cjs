const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store room data
const rooms = new Map();
const userStats = new Map();

// Sample text for typing test
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once.",
  "Programming is not about what you know; it's about what you can figure out. The best way to learn is by doing.",
  "In the world of technology, change is the only constant. Adaptation and continuous learning are key to success.",
  "TypeScript is a programming language developed and maintained by Microsoft. It is a strict syntactical superset of JavaScript.",
  "React is a free and open-source front-end JavaScript library for building user interfaces based on UI components."
];

function getRandomText() {
  return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
}

function calculateWPM(correctChars, timeInSeconds) {
  if (timeInSeconds === 0) return 0;
  return Math.round((correctChars / 5) / (timeInSeconds / 60));
}

function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 0;
  return Math.round((correctChars / totalChars) * 100);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        gameState: 'waiting', // waiting, playing, finished
        text: getRandomText(),
        startTime: null,
        duration: 60 // seconds
      });
    }

    const room = rooms.get(roomId);
    room.users.set(socket.id, {
      id: socket.id,
      username,
      progress: 0,
      wpm: 0,
      accuracy: 0,
      currentPosition: 0,
      correctChars: 0,
      totalChars: 0,
      finished: false,
      startTime: null
    });

    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username;

    // Send room data to the user
    socket.emit('room-joined', {
      roomId,
      text: room.text,
      gameState: room.gameState,
      users: Array.from(room.users.values())
    });

    // Broadcast updated user list to all users in room
    io.to(roomId).emit('users-updated', Array.from(room.users.values()));
    
    console.log(`${username} joined room ${roomId}`);
  });

  socket.on('start-game', () => {
    const roomId = socket.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    if (room.gameState !== 'waiting') return;

    room.gameState = 'playing';
    room.startTime = Date.now();
    
    // Reset all user stats
    room.users.forEach(user => {
      user.progress = 0;
      user.wpm = 0;
      user.accuracy = 0;
      user.currentPosition = 0;
      user.correctChars = 0;
      user.totalChars = 0;
      user.finished = false;
      user.startTime = Date.now();
    });

    io.to(roomId).emit('game-started', {
      text: room.text,
      startTime: room.startTime
    });

    console.log(`Game started in room ${roomId}`);
  });

  socket.on('typing-progress', (data) => {
    const roomId = socket.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    const user = room.users.get(socket.id);
    if (!user || room.gameState !== 'playing') return;

    const { currentPosition, correctChars, totalChars } = data;
    const now = Date.now();
    const timeElapsed = (now - user.startTime) / 1000; // seconds

    // Update user stats
    user.currentPosition = currentPosition;
    user.correctChars = correctChars;
    user.totalChars = totalChars;
    user.progress = Math.round((currentPosition / room.text.length) * 100);
    user.wpm = calculateWPM(correctChars, timeElapsed);
    user.accuracy = calculateAccuracy(correctChars, totalChars);

    // Check if user finished
    if (currentPosition >= room.text.length && !user.finished) {
      user.finished = true;
      user.finalWPM = user.wpm;
      user.finalAccuracy = user.accuracy;
      
      socket.emit('typing-finished', {
        wpm: user.wpm,
        accuracy: user.accuracy,
        timeElapsed: Math.round(timeElapsed)
      });
    }

    // Broadcast updated stats to all users in room
    io.to(roomId).emit('users-updated', Array.from(room.users.values()));
  });

  socket.on('reset-game', () => {
    const roomId = socket.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.gameState = 'waiting';
    room.text = getRandomText();
    room.startTime = null;

    // Reset all users
    room.users.forEach(user => {
      user.progress = 0;
      user.wpm = 0;
      user.accuracy = 0;
      user.currentPosition = 0;
      user.correctChars = 0;
      user.totalChars = 0;
      user.finished = false;
      user.startTime = null;
    });

    io.to(roomId).emit('game-reset', {
      text: room.text,
      users: Array.from(room.users.values())
    });

    console.log(`Game reset in room ${roomId}`);
  });

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    console.log('User disconnected:', socket.id);

    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.users.delete(socket.id);

      if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted - no users left`);
      } else {
        io.to(roomId).emit('users-updated', Array.from(room.users.values()));
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});