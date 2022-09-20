const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("Connected.");

  console.log('client id - ' + socket.id);

  console.log('コネクション数', socket.client.conn.server.clientsCount);
  io.sockets.emit('count', socket.client.conn.server.clientsCount);

  socket.on('disconnect', function (data) {
    console.log('コネクション数', socket.client.conn.server.clientsCount);
    io.sockets.emit('count', socket.client.conn.server.clientsCount);
  });

  socket.on("post_message", (msg) => {

    console.log('client id - ' + socket.id);
    console.log(msg);

    io.emit("recv_message", msg);
  });
});

http.listen(5000, () => {
  console.log("Listen start.");
});
