const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

// ✅ Correct CORS
app.use(cors({
  origin: "https://social-media-9jg8.onrender.com",  // your new frontend URL
  credentials: true
}));

// ---------- Serve Frontend in Production ----------
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(frontendPath, 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running in development mode');
  });
}
// -------------------------------------------------

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);

const server = http.createServer(app);

// ✅ FIX SOCKET.IO CORS
const io = new Server(server, {
  cors: {
    origin: "https://social-media-9jg8.onrender.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat ${chatId}`);
  });

  socket.on('sendMessage', (message) => {
    console.log(`Message received from client: ${message.content}`);
    io.to(message.chatId).emit('receiveMessage', message);
    console.log(`Message sent to chat ${message.chatId}: ${message.content}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server is running at PORT ${PORT}`));


