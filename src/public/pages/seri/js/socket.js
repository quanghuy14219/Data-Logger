const socket = io();

socket.emit("hello", "Hello, server!");

socket.on("hello", function (data) {
  console.log("Received a message from the server: ", data);
  try {
    const auth = localStorage.getItem("auth");
    if (auth) {
      const { user, token } = JSON.parse(auth);
      console.log("Authenticated");
      token && socket.emit("authorization", token);
    }
  } catch (error) {}
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

socket.on("force-logout", function () {
  window.dispatchEvent(new CustomEvent("logout"));
});

window.addEventListener("authentication complete", (event) => {
  const auth = event.detail;
  socket.auth = auth;
  const { user, token } = auth;
  socket.emit("authorization", token);
});
