require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { initStockCron } = require('./services/stockAlertService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const pizzaRoutes = require('./routes/pizzaRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach io to express app so controllers can emit real-time events
app.set('io', io);

// Socket.IO Room Management
io.on('connection', (socket) => {
  console.log(`🔌 Socket client connected: ${socket.id}`);

  // Customer joins specific order room to receive live updates
  socket.on('join_order_room', (orderId) => {
    if (orderId) {
      const room = `order_${orderId}`;
      socket.join(room);
      console.log(`👤 Socket ${socket.id} joined room: ${room}`);
    }
  });

  socket.on('leave_order_room', (orderId) => {
    if (orderId) {
      const room = `order_${orderId}`;
      socket.leave(room);
      console.log(`👋 Socket ${socket.id} left room: ${room}`);
    }
  });

  // Admin joins global kitchen management room
  socket.on('join_admin_room', () => {
    socket.join('admin_kitchen');
    console.log(`👨‍🍳 Socket ${socket.id} joined admin_kitchen`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Pizzeria Bella API',
    uptime: process.uptime(),
  });
});

// Serve Frontend in Production if built
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    // Initialize scheduled node-cron stock monitoring job
    initStockCron();

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Pizza Delivery Server running on port ${PORT}`);
      console.log(`📡 Socket.IO Real-time Engine initialized`);
      console.log(`🍕 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();

