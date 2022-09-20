const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("Connected.");
  socket.on("post_message", (msg) => {
    io.emit("recv_message", msg);
  });
});

http.listen(5000, () => {
  console.log("Listen start.");
});
