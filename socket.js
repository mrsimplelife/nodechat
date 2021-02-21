const cookieParser = require("cookie-parser");
const session = require("express-session");
const SocketIO = require("socket.io");

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
    socket.on("disconnect", () => {
      console.log("chat disconnected!!!!!!");
      socket.leave(roomId);
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
