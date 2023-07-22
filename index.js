/** @format */

import express from "express";
import { Server as socketServer } from "socket.io";
import { corsConfig, socketCorsConfig } from "./conf.js";
import cors from "cors";

const activeUsers = new Map();

const app = express();
app.use(cors(corsConfig));

const server = app.listen(3000, function () {
  console.log(`Listening on port 3000`);
  console.log(`http://localhost: 3000`);
});

const io = new socketServer(server, socketCorsConfig);

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    activeUsers.delete(socket.id);
    io.emit("update Users", [...activeUsers.entries()]);
  });

  socket.on("new User", (userName) => {
    console.log("new user", socket.id, userName);
    activeUsers.set(socket.id, userName);

    io.emit("update Users", [...activeUsers.entries()]);
  });
  socket.on("new private msg", (msg) => {
    socket.to(msg.to).emit("new private msg", msg);
  });

  socket.on("is typing", (to) => {
    socket.to(to).emit("is typing", socket.id);
  });

  socket.on("stopped typing", (to) => {
    socket.to(to).emit("stopped typing");
  });
});
