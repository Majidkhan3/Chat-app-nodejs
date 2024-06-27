const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

// const socket = reqiure("socket.io");
const app = express();
require("dotenv").config();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

// Debugging environment variables
console.log("Checking environment variables");
console.log(`MONGO_URL: ${process.env.MONGO_URL}`);
console.log(`PORT: ${process.env.PORT}`);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log("DB Connection Error: ", err.message);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT}`);
  // Additional log to help identify where undefined might be coming from
  console.log("Server initialization complete");
});

// Additional log to ensure there are no other sources of 'undefined'
console.log("Initialization complete. Awaiting requests...");

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.OnlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    OnlineUsers.set(userId, socket.id);
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = OnlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data.msg);
    }
  });
});
