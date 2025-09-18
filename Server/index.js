const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const users = []; // 👥 In-memory user store

// 🔐 Sign Up
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "Signup successful" });
});

// 🔓 Sign In
app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.status(200).json({ message: "Signin successful", user: { username } });
});

io.on("connection", (socket) => {
  console.log(`✅ ${socket.id} connected`);
});

server.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});