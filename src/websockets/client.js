var out = document.getElementById("out");
var msg = document.getElementById("msg");
var btn = document.getElementById("btn");
var sock = new WebSocket("ws://127.0.0.1:5000/");
sock.addEventListener("open", (e) => {
  console.log("Connected.");
});
sock.addEventListener("close", (e) => {
  console.log("Closed.");
});
sock.addEventListener("error", (e) => {
  console.log("Error.");
});
sock.addEventListener("message", (e) => {
  out.innerText += e.data + "\n";
  msg.value = "";
  msg.focus();
});
btn.addEventListener("click", (e) => {
  sock.send(msg.value);
});
msg.focus();