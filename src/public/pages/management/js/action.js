window.addEventListener("row-clicked", (event) => {
  const account = event.detail;
  const showBtn = document.getElementById("btn-show-action-pane");
  showBtn && showBtn.click();

  const label = document.getElementById("offcanvasRightLabel");
  label.textContent = `${account.role}: ${account.username}`;

  const id = document.getElementById("action-pane-inf-id");
  id.textContent = account._id;

  const createAt = document.getElementById("action-pane-inf-createAt");
  createAt.textContent = account.createAt;

  const deleteDiv = document.getElementById("tabpane-delete-account-container");
  if (account.role === "ADMIN") {
    deleteDiv.style.display = "none";
  } else {
    deleteDiv.style.display = "block";
  }
});

async function deleteAccount() {
  const id = document.getElementById("action-pane-inf-id")?.textContent;
  if (id && window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      await axios
        .delete(`/api/user/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => {
          const showBtn = document.getElementById("btn-show-action-pane");
          showBtn && showBtn.click();
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      logout();
    }
  }
}

async function logoutAccount() {
  const id = document.getElementById("action-pane-inf-id")?.textContent;
  if (id) {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      await axios
        .get(`/api/user/logout/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => {
          //    const showBtn = document.getElementById("btn-show-action-pane");
          //    showBtn && showBtn.click();
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      logout();
    }
  }
}

function handleChangePasswordInput(event) {
  const btnChangePassword = document.getElementById("btn-change-password");
  if (event.target.value) {
    btnChangePassword.style.display = "inline-block";
  } else {
    btnChangePassword.style.display = "none";
  }
}

async function changePassword() {
  const id = document.getElementById("action-pane-inf-id")?.textContent;
  const passwordInput = document.getElementById("tabpane-new-password-input");
  if (id && passwordInput && passwordInput.value) {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      await axios
        .put(
          `/api/user`,
          {
            id: id,
            password: passwordInput.value,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then(async (res) => {
          passwordInput.value = "";
          const btnChangePassword = document.getElementById(
            "btn-change-password"
          );
          btnChangePassword.style.display = "none";
          //   window.alert("Mật khẩu đã được thay đổi thành công");
          if (
            window.confirm(
              "Mật khẩu đã được thay đổi thành công. Đăng xuất khỏi các thiết bị?"
            )
          ) {
            await logoutAccount();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      logout();
    }
  }
}
