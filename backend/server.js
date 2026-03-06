require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const http    = require('http');
const { Server } = require('socket.io');

const connectDB       = require('./config/db');
const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const assetRoutes     = require('./routes/assetRoutes');
const incidentRoutes  = require('./routes/incidentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Connect to MongoDB
connectDB();

const app    = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'https://it-helpdesk-ifu2zo9jy-sravanip2165-9382s-projects.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join_incident', (incidentId) => {
    socket.join(incidentId);
    console.log(`Socket ${socket.id} joined incident room: ${incidentId}`);
  });

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room: user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'https://it-helpdesk-ifu2zo9jy-sravanip2165-9382s-projects.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/assets',    assetRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IT HelpDesk API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});