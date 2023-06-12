const clearNotification = () => {
  const usernameNotify = document.getElementById("username-notification");
  const passwordNotify = document.getElementById("password-notification");
  const loginNotify = document.getElementById("login-notification");
  if (usernameNotify) {
    usernameNotify.textContent = "";
  }
  if (passwordNotify) {
    passwordNotify.textContent = "";
  }
  if (loginNotify) {
    loginNotify.textContent = "";
  }
};

const handleKeyPressUsername = (event) => {
  const password = document.getElementById("password-input");
  if (event.keyCode === 13) {
    event.preventDefault();
    password && password.focus();
  }
};

const handleKeyPressPassword = async (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    await login();
  }
};

const login = async () => {
  const username = document.getElementById("username-input")?.value;
  const password = document.getElementById("password-input")?.value;
  const usernameNotify = document.getElementById("username-notification");
  const passwordNotify = document.getElementById("password-notification");
  const loginNotify = document.getElementById("login-notification");
  if (!username && usernameNotify) {
    usernameNotify.textContent = "Username không được để trống";
  }
  if (!password && passwordNotify) {
    passwordNotify.textContent = "Mật khẩu không được để trống";
  }
  axios
    .post("/api/user/login", {
      username: username,
      password: password,
    })
    .then((res) => {
      const data = res?.data;
      if (data) {
        localStorage.setItem("auth", JSON.stringify(data));
        if (!redirect()) {
          const { user } = data;
          switch (user.role) {
            case "ADMIN":
              window.location.assign(`${window.location.origin}/management`);
              break;
            case "USER":
              window.location.assign(`${window.location.origin}`);
              break;
          }
        }
      }
    })
    .catch((err) => {
      const msg = err?.response?.data?.err;
      if (msg && loginNotify) {
        loginNotify.textContent = msg;
      }
    });
};

//  Check authentication status
(async () => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    const { token } = JSON.parse(auth);
    fetch("/api/user/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
    })
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("auth", JSON.stringify(data));
        if (!redirect()) {
          const { user } = data;
          switch (user.role) {
            case "ADMIN":
              window.location.assign(`${window.location.origin}/management`);
              break;
            case "USER":
              window.location.assign(`${window.location.origin}`);
              break;
          }
        }
      })
      .catch((error) => {
        if (error === "Token invalid") {
          localStorage.removeItem("auth");
        }
      });
  }
})();

const redirect = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirect");
  if (redirectUrl) {
    window.location.assign(redirectUrl);
    return true;
  }
  return false;
};

function showDialog() {
  var dialog = document.getElementById("dialog");
  dialog.style.display = "flex";

  var dialog = document.getElementById("main");
  dialog.style.display = "none";
}

function closeDialog() {
  var dialog = document.getElementById("dialog");
  dialog.style.display = "none";

  var dialog = document.getElementById("main");
  dialog.style.display = "flex";
}
