const loadDataToTable = (data, clear = true) => {
  const tblBody = document.getElementById("tbl_data");
  // clear table
  if (clear && tblBody) {
    const rowCount = tblBody.rows.length;
    for (let i = rowCount - 1; i >= 0; i--) {
      tblBody.deleteRow(i);
    }
  }

  tblBody &&
    data &&
    Array.isArray(data) &&
    data.forEach((user) => {
      // Realtime update
      window.addEventListener("change-series", (event) => {
        const account = event?.detail?.account;
        if (account._id === user._id) {
          user.series = account.series;
        }
      });
      //   if (user.role === "ADMIN") {
      //     return;
      //   }
      const row = clear ? tblBody.insertRow() : tblBody.insertRow(0);
      row.id = `user-${user._id}`;
      row.classList.add("cursor");
      row.addEventListener("click", () => {
        window.dispatchEvent(
          new CustomEvent("row-clicked", {
            detail: user,
          })
        );
      });

      // const idCell = row.insertCell();
      // idCell.textContent = user._id;

      const usernameCell = row.insertCell();
      usernameCell.textContent = user.username;

      const roleCell = row.insertCell();
      roleCell.textContent =
        user.role === "ADMIN" ? "Quản trị viên" : "Người dùng";

      const unitCell = row.insertCell();
      unitCell.textContent = user.unit || "";
      unitCell.id = `${user._id}-unit`;

      const phoneCell = row.insertCell();
      phoneCell.textContent = user.phone || "";
      phoneCell.id = `${user._id}-contact`;

      // const createAtCell = row.insertCell();
      // createAtCell.textContent = user.createAt;

      const statusCell = row.insertCell();
      statusCell.id = `status-${user._id}`;
      statusCell.textContent = "offline";
    });
};

const loadSeriesToTable = (data, clear = true) => {
  const tblBody = document.getElementById("tbl_series");
  // clear table
  if (clear && tblBody) {
    const rowCount = tblBody.rows.length;
    for (let i = rowCount - 1; i >= 0; i--) {
      tblBody.deleteRow(i);
    }
  }

  tblBody &&
    data &&
    Array.isArray(data) &&
    data.forEach((seri) => {
      const row = clear ? tblBody.insertRow() : tblBody.insertRow(0);
      row.id = `seri-${seri._id}`;
      row.classList.add("cursor");
      row.addEventListener("click", () => {
        window.dispatchEvent(
          new CustomEvent("seri-clicked", {
            detail: seri,
          })
        );
      });

      // const idCell = row.insertCell();
      // idCell.textContent = seri._id;

      const seriCell = row.insertCell();
      seriCell.textContent = seri.seri;

      const unitCell = row.insertCell();
      unitCell.textContent = seri.unit || "";
      unitCell.id = `${seri._id}-unit`;

      const phoneCell = row.insertCell();
      phoneCell.textContent = seri.phone || "";
      phoneCell.id = `${seri._id}-contact`;

      // const createAtCell = row.insertCell();
      // createAtCell.textContent = seri.createAt;
    });
};

const fetchData = async () => {
  const auth = localStorage.getItem("auth");
  if (!auth) {
    logout();
  }
  try {
    const { user, token } = JSON.parse(auth);
    const data = await axios
      .get("/api/user", {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        return res?.data?.users;
      })
      .catch((err) => {
        return null;
      });
    return data;
  } catch (error) {
    logout();
  }
};

const fetchSeries = async () => {
  const auth = localStorage.getItem("auth");
  if (!auth) {
    logout();
  }
  try {
    const { user, token } = JSON.parse(auth);
    const series = await axios
      .get("/api/series", {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        return res?.data?.series;
      })
      .catch((err) => {
        return null;
      });
    return series;
  } catch (error) {
    logout();
  }
};

const loadData = async () => {
  const [users, series] = await Promise.all([fetchData(), fetchSeries()]);

  loadDataToTable(users);
  loadSeriesToTable(series);
};

loadData();

window.addEventListener("list-client", (event) => {
  const users = event.detail;
  if (users) {
    users.forEach((user) => {
      const cell = document.getElementById(`status-${user._id}`);
      if (cell) {
        cell.textContent = "online";
      }
    });
  }
});

window.addEventListener("client-change-state", (event) => {
  const { user, state } = event.detail;
  if (user && state) {
    const cell = document.getElementById(`status-${user._id}`);
    if (cell) {
      cell.textContent = state;
    }
  }
});

window.addEventListener("new-account", (event) => {
  const account = event?.detail?.account;
  if (account) {
    loadDataToTable([account], false);
  }
});

window.addEventListener("new-seri", (event) => {
  const seri = event?.detail?.seri;
  if (seri) {
    loadSeriesToTable([seri], false);
  }
});

window.addEventListener("change-info", (event) => {
  const account = event?.detail?.account;
  // console.log("Change ", account);
  if (account) {
    const unit = document.getElementById(`${account._id}-unit`);
    const phone = document.getElementById(`${account._id}-contact`);
    if (unit) {
      unit.textContent = account.unit;
    }
    if (phone) {
      phone.textContent = account.phone;
    }
  }
});

window.addEventListener("change-seri-info", (event) => {
  const seri = event?.detail?.seri;
  if (seri) {
    const unit = document.getElementById(`${seri._id}-unit`);
    const phone = document.getElementById(`${seri._id}-contact`);
    if (unit) {
      unit.textContent = seri.unit;
    }
    if (phone) {
      phone.textContent = seri.phone;
    }
  }
});

window.addEventListener("delete-account", (event) => {
  const id = event?.detail?._id;
  if (id) {
    const row = document.getElementById(`user-${id}`);
    row && row.remove();
  }
});
