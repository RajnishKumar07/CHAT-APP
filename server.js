const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const { formatMessage } = require("./utils/message");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "Chat App Bot";
//Set Static folder
app.use(express.static(path.join(__dirname, "public")));

//Run when client Connect
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Chat App!!"));

    //Broadcast user when connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUser", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    console.log(user, msg);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Run when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(user.username, `user has left the chat`)
      );
    }

    io.to(user.room).emit("roomUser", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, console.log(`Server listening on port ${PORT}`));
