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

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;