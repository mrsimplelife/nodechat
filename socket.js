const SocketIO = require("socket.io");
module.exports = (server) => {
  const io = SocketIO(server, { path: "/socket.io" });
  io.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("new client", ip, socket.id, req.ip);
    socket.on("disconnect", () => {
      console.log("finish client", ip, socket.id);
      clearInterval(socket.interval);
    });
    socket.on("error", (error) => {
      console.log(error);
    });
    socket.on("reply", (error) => {
      console.log(error);
    });
    socket.interval = setInterval(() => {
      socket.emit("news", "hi");
    }, 3000);
  });
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
