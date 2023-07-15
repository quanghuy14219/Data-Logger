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
  window.dispatchEvent(
    new CustomEvent("new-svg2m-data", {
      detail: svg2m,
    })
  );
});

socket.on("new-seri", function (seri) {
  window.dispatchEvent(
    new CustomEvent("new-seri", {
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

function displayDateTime() {
  // Lấy thời gian hiện tại
  var now = new Date();

  // Tạo đối tượng múi giờ GMT+7
  var gmt7 = new Date();

  // Lấy thông tin ngày và giờ theo định dạng mong muốn
  var date = gmt7.toISOString().slice(0, 10);
  var time = gmt7.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  // Hiển thị ngày và giờ trên trang web
  document.getElementById("datetime").textContent =
    time + " " + date + " GMT+7";
}

// Cập nhật thời gian mỗi giây
setInterval(displayDateTime, 1000);
