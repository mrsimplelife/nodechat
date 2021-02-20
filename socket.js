const WebSocket = require("ws");
module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  wss.on("connection", (ws, req) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("new client", ip);
    ws.on("message", (message) => {
      console.log(message);
    });
    ws.on("error", (error) => {
      console.error(error);
    });
    ws.on("close", () => {
      console.log("close", ip);
      clearInterval(ws.interval);
    });
    ws.interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) ws.send("hi");
    }, 3000);
  });
};
