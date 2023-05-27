const socket = io();

socket.emit("hello", "Hello, server!");

socket.on("hello", function (data) {
  console.log("Received a message from the server: ", data);
});

socket.on("new-data", function (svg2m) {
  // console.log("Server send new data: ", svg2m);
  window.postMessage(
    {
      type: "NEW_SVG2M_DATA",
      svg2m: svg2m,
    },
    window.location.origin
  );
});
