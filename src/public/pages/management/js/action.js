let currentUser = null;

window.addEventListener("row-clicked", (event) => {
  const account = event.detail;
  currentUser = account;
  const showBtn = document.getElementById("btn-show-action-pane");
  showBtn && showBtn.click();

  const label = document.getElementById("offcanvasRightLabel");
  label.textContent = `${account.role}: ${account.username}`;

  const id = document.getElementById("action-pane-inf-id");
  id.textContent = account._id;

  const createAt = document.getElementById("action-pane-inf-createAt");
  createAt.textContent = account.createAt;

  const unit = document.getElementById("tabpane-new-unit-input");
  unit.value = account.unit || "";

  const phone = document.getElementById("tabpane-new-contact-input");
  phone.value = account.phone || "";

  const deleteDiv = document.getElementById("tabpane-delete-account-container");
  if (account.role === "ADMIN") {
    deleteDiv.style.display = "none";
  } else {
    deleteDiv.style.display = "block";
  }

  const searchBox = document.getElementById("tab-pane-search-box-container");
  if (account.role === "ADMIN") {
    searchBox.style.display = "none";
  } else {
    searchBox.style.display = "inline-block";
  }

  // console.log(account.series);
  const ulSeries = document.getElementById("access-series-container");
  while (ulSeries.firstChild) {
    ulSeries.removeChild(ulSeries.firstChild);
  }
  if (account.role === "ADMIN") {
    const li = document.createElement("li");
    li.textContent = "Tất cả các seri";
    ulSeries.appendChild(li);
  } else {
    account.series &&
      account.series.forEach((seri) => {
        const li = document.createElement("li");
        li.id = `seri-${account._id}-${seri}`;
        const seriElement = document.createElement("span");
        seriElement.textContent = seri;
        const btnElement = document.createElement("button");
        btnElement.innerText = "Delete";
        btnElement.addEventListener("click", async () => {
          const userId =
            document.getElementById("action-pane-inf-id").textContent;
          const result = await putSeri(userId, seri, false);
          if (result) {
            li.remove();
          }
        });
        li.appendChild(seriElement);
        li.appendChild(btnElement);
        ulSeries.appendChild(li);
      });
  }
});

window.addEventListener("new-seri-access", (event) => {
  const ulSeries = document.getElementById("access-series-container");
  const { userId, seri } = event.detail;

  if (currentUser && currentUser._id === userId) {
    if (!currentUser.series || !currentUser.series.includes(seri.toString())) {
      const li = document.createElement("li");
      const seriElement = document.createElement("span");
      seriElement.textContent = seri;
      const btnElement = document.createElement("button");
      btnElement.textContent = "Delete";
      btnElement.addEventListener("click", async () => {
        // handle call api
        const userId =
          document.getElementById("action-pane-inf-id").textContent;
        const result = await putSeri(userId, seri, false);
        if (result) {
          li.remove();
        }
      });
      // console.log("Append ", seri, " ", currentUser.series, " ", typeof seri);
      li.appendChild(seriElement);
      li.appendChild(btnElement);
      ulSeries.appendChild(li);
    }
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

function handleChangeUnitAndContactInput(event) {
  const unit = document.getElementById("tabpane-new-unit-input").value;
  const phone = document.getElementById("tabpane-new-contact-input").value;
  const btnChangeInf = document.getElementById("btn-change-unit-contact");

  if (unit !== currentUser.unit || phone !== currentUser.phone) {
    btnChangeInf.style.display = "inline-block";
  } else {
    btnChangeInf.style.display = "none";
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
          `/api/user/password`,
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

async function changeInfo() {
  const id = document.getElementById("action-pane-inf-id")?.textContent;
  const unit = document.getElementById("tabpane-new-unit-input").value;
  const phone = document.getElementById("tabpane-new-contact-input").value;

  if (id) {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      await axios
        .put(
          `/api/user/info`,
          {
            id: id,
            unit: unit,
            contact: phone,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then(async (res) => {
          const btnChangeInf = document.getElementById(
            "btn-change-unit-contact"
          );
          btnChangeInf.style.display = "none";
          currentUser.unit = unit;
          currentUser.phone = phone;
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      logout();
    }
  }
}

async function deleteSeri() {
  const id = document.getElementById("seri-pane-inf-id")?.textContent;
  if (
    id &&
    window.confirm(
      "Hành động này sẽ xóa tất cả dữ liệu liên quan. Bạn chắc chắn chứ?"
    )
  ) {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      await axios
        .delete(`/api/series/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => {
          const showBtn = document.getElementById("btn-show-seri-pane");
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
