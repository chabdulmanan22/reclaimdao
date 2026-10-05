const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const voteRoutes = require('./routes/votes');
const contributionRoutes = require('./routes/contributions');
const adminRoutes = require('./routes/admin');
const mailRoutes = require('./routes/mail');
const passwordRoutes = require('./routes/password');
const settingsRoutes = require('./routes/settings');
const contentRoutes = require('./routes/content');
const joinRoutes = require('./routes/join');
const articleRoutes = require('./routes/articles');
const scamCompaniesRoutes = require('./routes/scamCompanies');

const app = express();
const http = require('http');
const server = http.createServer(app);
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server, path: '/ws' });
global.__WSClients = global.__WSClients || new Set();
wss.on('connection', (ws, req) => {
  try {
    global.__WSClients.add(ws);
    console.log(`[WebSocket] Client connected. Total clients: ${global.__WSClients.size}`);
  } catch (err) {
    console.error('[WebSocket] Connection error:', err);
  }
  ws.on('close', () => {
    try {
      global.__WSClients.delete(ws);
      console.log(`[WebSocket] Client disconnected. Total clients: ${global.__WSClients.size}`);
    } catch (err) {
      console.error('[WebSocket] Disconnect error:', err);
    }
  });
  ws.on('error', (err) => {
    console.error('[WebSocket] Client error:', err);
  });
});
global.__wsBroadcast = global.__wsBroadcast || function (payload) {
  try {
    const message = payload || { type: 'users_updated' };
    const clientCount = global.__WSClients.size;
    console.log(`[WebSocket] Broadcasting to ${clientCount} clients:`, message.type);
    for (const ws of global.__WSClients) {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(message));
      }
    }
  } catch (err) {
    console.error('[WebSocket] Broadcast error:', err);
  }
};
const User = require('./models/User');

// If behind a proxy (including CRA dev server), trust proxy headers
app.set('trust proxy', 1);

// Security middleware (allow cross-origin resource loading and disable frameguard to permit iframes)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: false
}));

// Rate limiting disabled for development

// CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Static serving for top-level images (branding assets)
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, '../client/public')));

// Allow embedding documents in iframe by removing X-Frame-Options header for this route
app.use('/documents', (req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
});
app.use('/documents', express.static(path.join(__dirname, '../documents')));

// Disable buffering so Mongoose queries fail fast and trigger localStore fallbacks when MongoDB is offline
mongoose.set('bufferCommands', false);

// Persistent Local / Cloud MongoDB connection
const fs = require('fs');

async function initMongoDB() {
  let connected = false;
  const configuredUri = process.env.MONGODB_URI;

  // 1. Try external/configured MongoDB if provided
  if (configuredUri) {
    try {
      console.log('[Database] Connecting to configured MongoDB URI:', configuredUri);
      await mongoose.connect(configuredUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      connected = true;
      console.log('[Database] Connected to MongoDB successfully');
    } catch (e) {
      console.warn('[Database] Configured URI unreachable:', e.message);
    }
  }

  // 2. If not connected, try local MongoMemoryServer if available
  if (!connected) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbDir = path.join(__dirname, 'data/mongodb');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      console.log('[Database] Starting local persistent MongoDB instance...');
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbDir,
          storageEngine: 'wiredTiger'
        }
      });
      const localUri = mongod.getUri();
      console.log('[Database] Local persistent MongoDB active at:', localUri);
      await mongoose.connect(localUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      connected = true;
      console.log('[Database] Connected to Local MongoDB (ReclaimDAO Database)');
    } catch (localErr) {
      console.warn('[Database Notice] Standalone MongoDB server not found, operating in high-performance localStore datastore mode');
    }
  }

  if (connected) {
    // Seed Admin Account
    try {
      const email = process.env.ADMIN_EMAIL || 'admin@reclaimdao.org';
      const password = process.env.ADMIN_PASSWORD || 'ADMIN1234';
      if (email && password) {
        const bcrypt = require('bcryptjs');
        let admin = await User.findOne({ email }).select('+password');
        if (!admin) {
          admin = new User({ firstName: 'Admin', lastName: 'User', email, password, role: 'admin', isActive: true });
          await admin.save();
          console.log('[DB Seed] Admin account created:', email);
        } else {
          let changed = false;
          if (admin.role !== 'admin') { admin.role = 'admin'; changed = true; }
          if (!admin.isActive) { admin.isActive = true; changed = true; }
          if (changed) { await admin.save(); }
        }
      }
    } catch (seedErr) {
      console.warn('[DB Seed Notice]', seedErr.message);
    }
  }
}

initMongoDB();



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/join', joinRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/scam-companies', scamCompaniesRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const clientBuildPath = path.join(__dirname, '../client/build');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'API server running', environment: process.env.NODE_ENV || 'development' });
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
