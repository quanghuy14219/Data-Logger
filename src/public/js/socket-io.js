const socket = io();

socket.emit("hello", "Hello, server!");

socket.on("hello", function (data) {
  console.log("Received a message from the server:", data);
});

socket.on("new-data", function (data) {
  window.postMessage(
    {
      type: "RELOAD_TABLE",
    },
    window.location.origin
  );
});
