const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const { rateLimit } = require('express-rate-limit');
const path = require('path');
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const db = require("./until/db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/auth", authRoute);
app.use("/user", userRoute);

const port = process.env.PORT || 3000;
let activeUsers = [];

const globalChatNamespace = io.of('/global-chat');
globalChatNamespace.on('connection', (socket) => {

  socket.on('user_connected', (username) => {
    socket.username = username;
    activeUsers.push({"login": socket.username, "roomId": ''});
    globalChatNamespace.emit('user_connected', {"usersList": activeUsers, "login": username});
  });
  
  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter(user => user.login != socket.username)
    globalChatNamespace.emit('user_disconnected', {"usersList": activeUsers, "login": socket.username});
  });

  socket.on('leave', () => {
    socket.disconnect(true);
  });
  
  socket.on('message', (msg) => {
    db.query(
      "INSERT INTO messages(login, chat_type, message) VALUES (?, 'global', ?)",
      [socket.username, msg.message],
      (err, results) => {
        if (err) throw err;
        const insertedId = results.insertId;
        db.query(
          "SELECT * FROM messages WHERE id = ?",
          [insertedId],
          (err, selectResults) => {
            if (err) throw err;
            const insertedMessage = selectResults[0];
            globalChatNamespace.emit('message', insertedMessage);
          }
        );
      }
    );
  });
});



const groupChat = io.of('/group-chat');
groupChat.on('connection', (socket) => {

  
  socket.on('disconnect', (data) => {
    activeUsers = activeUsers.filter(user => user.login != data.user);
  });
  
  socket.on('leave', (data) => {
    activeUsers = activeUsers.filter(user => user.login != data.user);
    groupChat.emit('user_disconnected', {"usersList": activeUsers, "login": data.user, "roomId": data.roomID});
    socket.leave(data.roomID);
  });

  socket.on('joinRoom', ({ user, roomID }) => {
    socket.username = user.login;
    activeUsers.push({"login": user, "roomId": roomID});
    socket.join(roomID);
    groupChat.emit('connected', {"roomID": roomID, "login": user, "userList": activeUsers})
  });

  socket.on('message', (msg) => {
    socket.join(msg.chat_id);
      db.query(
        "INSERT INTO messages(login, chat_type, chat_id, message) VALUES (?, 'group', ?, ?)",
        [msg.login, msg.chat_id, msg.message],
        (err, results) => {
          if (err) throw err;
          const insertedId = results.insertId;
          db.query(
            "SELECT * FROM messages WHERE id = ?",
            [insertedId],
            (err, selectResults) => {
              if (err) throw err;
              const insertedMessage = selectResults[0];
              groupChat.to(msg.chat_id).emit('message', insertedMessage);
            }
          );
        }
      );
  });
});

app.use("/getOnline", (req, res, next) =>{
  res.status(200).json(activeUsers)
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});