require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Import configurations and middleware
const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { noSQLInjectionProtection, inputSanitization } = require('./middleware/security');
const { generalLimiter } = require('./middleware/rateLimiter');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ["GET", "POST"],
};

const io = new Server(server, {
  cors: corsOptions,
});

// Database connection
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(noSQLInjectionProtection);
app.use(inputSanitization);
app.use(generalLimiter);

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.io
socketHandler(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[SERVER] Server running on port ${PORT}`);
});
