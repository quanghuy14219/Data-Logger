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

      const idCell = row.insertCell();
      idCell.textContent = user._id;

      const usernameCell = row.insertCell();
      usernameCell.textContent = user.username;

      const roleCell = row.insertCell();
      roleCell.textContent = user.role;

      const createAtCell = row.insertCell();
      createAtCell.textContent = user.createAt;

      const statusCell = row.insertCell();
      statusCell.id = `status-${user._id}`;
      statusCell.textContent = "offline";
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

const loadData = async () => {
  const data = await fetchData();
  console.log(data);
  loadDataToTable(data);
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

window.addEventListener("delete-account", (event) => {
  const id = event?.detail?._id;
  if (id) {
    const row = document.getElementById(`user-${id}`);
    row && row.remove();
  }
});
