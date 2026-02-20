/**
 * FlowML – Express Backend Server
 * API + orchestration layer between frontend and Python ML engine.
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const pipelineRoutes = require('./routes/pipelines');
const executeRoutes = require('./routes/execute');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'flowml-backend', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/upload', uploadRoutes);

// ─── Serve shared schema ──────────────────────────────────────────────────
app.get('/api/schema', (req, res) => {
  const schemaPath = path.join(__dirname, '..', 'shared', 'pipeline_schema.json');
  res.sendFile(schemaPath);
});

// ─── MongoDB Connection ────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowml';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 FlowML Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Starting server without database...');
    app.listen(PORT, () => {
      console.log(`🚀 FlowML Backend running on port ${PORT} (no DB)`);
    });
  });

module.exports = app;
