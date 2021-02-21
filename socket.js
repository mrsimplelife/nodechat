const { default: axios } = require("axios");
const cookieParser = require("cookie-parser");
const SocketIO = require("socket.io");
const cookie = require("cookie-signature");
module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: "/socket.io" });

  const room = io.of("/room");
  room.on("connection", (socket) => {
    console.log("room connected!!!!!");
    socket.on("disconnect", () => {
      console.log("room disconnected!!!!!!");
    });
  });

  const chat = io.of("/chat");
  chat.use((socket, next) => {
    cookieParser(process.env.COOKIE_SECRET)(socket.request, {}, next);
  });
  chat.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });
  chat.on("connection", (socket) => {
    console.log("chat connected!!!!!");
    const req = socket.request;
    const {
      headers: { referer },
    } = req;
    const roomId = referer
      .split("/")
      [referer.split("/").length - 1].replace(/\?.+/, "");

    socket.join(roomId);
    socket.to(roomId).emit("join", {
      user: "system",
      chat: `${req.session.color} joined`,
    });
    socket.on("disconnect", () => {
      console.log("chat disconnected!!!!!!");
      socket.leave(roomId);
      const currentRoom = socket.adapter.rooms.get(roomId);
      const userCount = currentRoom ? currentRoom.size : 0;

      if (userCount === 0) {
        const signedCookie = cookie.sign(
          req.signedCookies["connect.sid"],
          process.env.COOKIE_SECRET
        );
        axios
          .delete(`http://localhost:3000/room/${roomId}`, {
            headers: {
              Cookie: `connect.sid=s%3A${signedCookie}`,
            },
          })
          .then(() => {
            console.log(`${roomId} deleted`);
          })
          .catch((err) => {
            console.error(err);
          });
        socket.to(roomId).emit("exit", {
          user: "system",
          chat: `${req.session.color} got out`,
        });
      }
    });
  });
  app.set("io", io);

  // io.on("connection", (socket) => {
  //   const req = socket.request;
  //   const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  //   console.log("new client", ip, socket.id, req.ip);
  //   socket.on("disconnect", () => {
  //     console.log("finish client", ip, socket.id);
  //     clearInterval(socket.interval);
  //   });
  //   socket.on("error", (error) => {
  //     console.log(error);
  //   });
  //   socket.on("reply", (error) => {
  //     console.log(error);
  //   });
  //   socket.interval = setInterval(() => {
  //     socket.emit("news", "hi");
  //   }, 3000);
  // });
};
// const WebSocket = require("ws");
// module.exports = (server) => {
//   const wss = new WebSocket.Server({ server });
//   wss.on("connection", (ws, req) => {
//     const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
//     console.log("new client", ip);
//     ws.on("message", (message) => {
//       console.log(message);
//     });
//     ws.on("error", (error) => {
//       console.error(error);
//     });
//     ws.on("close", () => {
//       console.log("close", ip);
//       clearInterval(ws.interval);
//     });
//     ws.interval = setInterval(() => {
//       if (ws.readyState === ws.OPEN) ws.send("hi");
//     }, 3000);
//   });
// };
