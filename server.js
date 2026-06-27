const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;
const rooms = {};

// Serve the frontend files
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log(`Device connected: ${socket.id}`);

  // Roku creates a room
  socket.on('create_room', () => {
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    rooms[roomCode] = { rokuId: socket.id, phoneId: null };
    socket.join(roomCode);
    socket.emit('room_created', roomCode);
    console.log(`Room ${roomCode} created.`);
  });

  // Phone joins the room
  socket.on('join_room', (roomCode) => {
    if (rooms[roomCode]) {
      rooms[roomCode].phoneId = socket.id;
      socket.join(roomCode);
      io.to(roomCode).emit('game_ready');
      console.log(`Phone joined room ${roomCode}`);
    } else {
      socket.emit('error_message', 'Room not found. Check your Roku TV code.');
    }
  });

  // Relay scores from Phone to Roku
  socket.on('send_score', (data) => {
    socket.to(data.roomCode).emit('receive_score', {
      rating: data.rating,
      points: data.points
    });
  });

  socket.on('disconnect', () => {
    console.log(`Device disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
