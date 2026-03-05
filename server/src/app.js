require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const treasuryRoutes = require('./routes/treasuryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const agentRoutes = require('./routes/agentRoutes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Payment']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api', rateLimiter); 

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;