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
  // console.log(clients);
});

socket.on("client-change-state", function (client) {
  window.dispatchEvent(
    new CustomEvent("client-change-state", {
      detail: client,
    })
  );
  // console.log(client);
});

socket.on("new-account", function (account) {
  window.dispatchEvent(
    new CustomEvent("new-account", {
      detail: account,
    })
  );
  // console.log(account);
});

socket.on("new-seri", function (seri) {
  window.dispatchEvent(
    new CustomEvent("new-seri", {
      detail: seri,
    })
  );
  console.log(seri);
});

socket.on("change-info", function (account) {
  window.dispatchEvent(
    new CustomEvent("change-info", {
      detail: account,
    })
  );
  // console.log(account);
});

socket.on("change-seri-info", function (seri) {
  window.dispatchEvent(
    new CustomEvent("change-seri-info", {
      detail: seri,
    })
  );
  console.log(seri);
});

socket.on("change-series", function (account) {
  window.dispatchEvent(
    new CustomEvent("change-series", {
      detail: account,
    })
  );
  // console.log(account);
  // console.log(account);
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

socket.on("seri-deleted", function (seri) {
  window.dispatchEvent(
    new CustomEvent("seri-deleted", {
      detail: seri,
    })
  );
});
