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

socket.on("force-logout", function () {
  console.log("force-logout");
  window.dispatchEvent(new CustomEvent("logout"));
});

window.addEventListener("authentication complete", (event) => {
  const auth = event.detail;
  socket.auth = auth;
  const { user, token } = auth;
  socket.emit("authorization", token);
});
