// src/socket.js
import { io } from 'socket.io-client';

const socket = io(' https://typing-test-2sce.onrender.com', {
  transports: ['websocket'],
  autoConnect: true, // or false if you want to control when it connects
});

export default socket;
