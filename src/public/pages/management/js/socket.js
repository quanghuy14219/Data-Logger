const socket = io();

socket.emit("hello", "Hello, server!");

socket.on("hello", function (data) {
  console.log("Received a message from the server: ", data);
});

socket.on("authorization", function (res) {
  if (res.code === 200) {
    socket.emit("list-client");
  }
});

socket.on("list-client", function (clients) {
  window.dispatchEvent(
    new CustomEvent("list-client", {
      detail: clients,
    })
  );
  console.log(clients);
});

socket.on("client-change-state", function (client) {
  window.dispatchEvent(
    new CustomEvent("client-change-state", {
      detail: client,
    })
  );
  console.log(client);
});

socket.on("new-account", function (account) {
  window.dispatchEvent(
    new CustomEvent("new-account", {
      detail: account,
    })
  );
  console.log(account);
});

socket.on("delete-account", function (account) {
  window.dispatchEvent(
    new CustomEvent("delete-account", {
      detail: account,
    })
  );
  console.log(account);
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
