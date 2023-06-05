function clearNotification() {
  [
    "username-notification",
    "password-notification",
    "confirm-password-notification",
    "add-account-notification",
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = "";
    }
  });
}

function clearInputs() {
  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const confirmPasswordInput = document.getElementById(
    "confirm-password-input"
  );

  if (usernameInput) {
    usernameInput.value = "";
  }
  if (passwordInput) {
    passwordInput.value = "";
  }
  if (confirmPasswordInput) {
    confirmPasswordInput.value = "";
  }
}

function validCheck() {
  let valid = true;

  const usernameNotify = document.getElementById("username-notification");
  const passwordNotify = document.getElementById("password-notification");
  const confirmPasswordNotify = document.getElementById(
    "confirm-password-notification"
  );

  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const confirmPasswordInput = document.getElementById(
    "confirm-password-input"
  );

  if (!usernameInput?.value && usernameNotify) {
    usernameNotify.textContent = "Username không được để trống";
    valid = false;
  }
  if (!passwordInput?.value && passwordNotify) {
    passwordNotify.textContent = "Mật khẩu không được để trống";
    valid = false;
  }
  if (!confirmPasswordInput?.value && confirmPasswordNotify) {
    confirmPasswordNotify.textContent = "Mật khẩu chưa được xác nhận";
    valid = false;
  }

  if (
    passwordInput &&
    confirmPasswordInput &&
    passwordInput.value !== confirmPasswordInput.value &&
    confirmPasswordNotify
  ) {
    confirmPasswordNotify.textContent = "Xác nhận mật khẩu sai";
    valid = false;
  }
  return valid;
}

async function addAccount() {
  if (validCheck()) {
    const username = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      await axios
        .post(
          "/api/user",
          {
            username: username,
            password: password,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then((res) => {
          const closeBtn = document.getElementById("btn-add-account-close");
          clearInputs();
          closeBtn && closeBtn.click();
          console.log(res);
        })
        .catch((err) => {
          const msg = err?.response?.data?.err;
          const addAccountNotify = document.getElementById(
            "add-account-notification"
          );
          if (msg && addAccountNotify) {
            addAccountNotify.textContent = msg;
          }
        });
    } catch (error) {
      logout();
    }
  }
}
