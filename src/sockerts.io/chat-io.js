const express = require('express')
const app = express()
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname))

const ids = new Set();

io.on('connection', (socket) => {
  console.log("Connected.");
  console.log('client id - ' + socket.id);
  console.log('コネクション数', socket.client.conn.server.clientsCount);

  io.sockets.emit('count', socket.client.conn.server.clientsCount);

  ids.add(socket.id);
  ids.forEach(id => {
    io.sockets.emit('welcome', id);
  });

  socket.on('disconnect', function (data) {
    ids.delete(socket.id);
    io.sockets.emit('byebye', socket.id);
    io.sockets.emit('count', socket.client.conn.server.clientsCount);
  });

  socket.on("post_message", (msg) => {

    console.log('client id - ' + socket.id);
    console.log(msg);

    io.emit("recv_message", msg);
  });

  socket.on("stream", (stream) => {
    io.emit("stream", socket.id + ':::' + stream);
  });
});

http.listen(5000, () => {
  console.log("Listen start.");
});
