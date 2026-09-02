const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path');
const http = require('http');
const multer = require('multer');

const { Server } = require('socket.io');
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

// ---------- TEMPORARY DIAGNOSTIC ROUTE ----------
// Tests raw multipart parsing on Render, independent of auth/db/cloudinary.
// Remove this block once we've confirmed the root cause.
const debugUpload = multer({ storage: multer.memoryStorage() });

app.post('/api/debug-upload', debugUpload.single('image'), (req, res) => {
  console.log('--- DEBUG UPLOAD ---');
  console.log('Content-Length header:', req.headers['content-length']);
  console.log('req.file present:', !!req.file);
  if (req.file) {
    console.log('Actual bytes received:', req.file.buffer.length);
    console.log('Original filename:', req.file.originalname);
  }
  console.log('req.body:', req.body);
  console.log('--------------------');
  res.json({
    contentLengthHeader: req.headers['content-length'],
    actualBytesReceived: req.file ? req.file.buffer.length : 0,
    fileReceived: !!req.file,
    body: req.body,
  });
});
// -------------------------------------------------

connectDB();

// ✅ Correct CORS
app.use(cors({
  origin: [ "http://localhost:3000",
  "https://social-media-delta-inky.vercel.app",
  "https://social-media-3q3l5cptk-vishals-projects-d10f5d85.vercel.app"],
  credentials: true
}));


// ---------- Serve Frontend in Production ----------
app.get('/', (req, res) => {
  res.send('API is running');
});
// -------------------------------------------------

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);

// ---------- Global error handler ----------
// Catches any error passed via next(err) or thrown inside async route handlers,
// logs the real stack trace to the server console, and returns a JSON error response.
app.use((err, req, res, next) => {
  console.error('UNHANDLED ERROR:', err.stack || err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something broke on the server',
  });
});
// -------------------------------------------

const server = http.createServer(app);

// ✅ FIX SOCKET.IO CORS
const io = new Server(server, {
  cors: {
    origin: "*",
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

  socket.on('sendMessage', (payload) => {
    // payload shape: { chatId, message: { content, sender, timestamp, ... } }
    console.log(`Message received from client: ${payload.message?.content}`);
    io.to(payload.chatId).emit('receiveMessage', payload.message);
    console.log(`Message sent to chat ${payload.chatId}: ${payload.message?.content}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server is running at PORT ${PORT}`));