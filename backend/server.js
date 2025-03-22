const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Middlewares
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Setup file upload using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// File upload endpoint
app.post(
  "/api/upload",
  require("./middleware/authMiddleware").authenticateToken,
  upload.single("file"),
  (req, res) => {
    res.json({ fileUrl: `/uploads/${req.file.filename}` });
  }
);

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  try {
    const user = jwt.verify(token, JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.io events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  // Join room (default to global)
  socket.on("joinRoom", (room) => {
    socket.join(room || "global");
  });

  // Listen for chat messages
  socket.on("chatMessage", async (data) => {
    const newMessage = new Message({
      sender: socket.user.id,
      content: data.content,
      type: data.type || "text",
      fileUrl: data.fileUrl || "",
      room: data.room || "global",
    });
    await newMessage.save();
    const populatedMessage = await newMessage.populate("sender", "username");
    io.to(data.room || "global").emit("message", populatedMessage);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
