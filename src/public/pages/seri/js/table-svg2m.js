let focusRow = {
  boxRef: null,
};

const loadDataToTable = (svg2mData, replace = true) => {
  const tableBody = document.getElementById("tbl_data");
  if (!tableBody) {
    console.log("No table body with id tal_data found");
    return;
  }
  // Clear current rows
  if (replace) {
    while (tableBody.rows.length > 0) {
      tableBody.deleteRow(0);
    }
  }

  const keys = [
    "date",
    "time",
    "longitude",
    "latitude",
    "mode",
    "draDoseRate",
    "draDose",
    "neutron",
    "actAlpha",
    "actBeta",
    "actGamma",
  ];

  if (svg2mData) {
    svg2mData.forEach((data, index) => {
      const rowNumber = index;
      const row = replace ? tableBody.insertRow() : tableBody.insertRow(0);
      row.id = `svg2m-${data._id}`;

      const checkCol = row.insertCell();
      const boxCheck = document.createElement("i");
      checkCol.appendChild(boxCheck);
      boxCheck.classList.add("fa-regular", "fa-square", "fa-xl");
      boxCheck.style.color = "rgb(0 0 0)";
      row.addEventListener("click", (event) => {
        // Check current row is focused
        if (focusRow.boxRef && focusRow.boxRef === boxCheck) {
          return;
        }

        // Remove current check box
        if (focusRow.boxRef) {
          focusRow.boxRef.classList.replace("fa-square-check", "fa-square");
          focusRow.boxRef.style.color = "rgb(0 0 0)";
          focusRow.row.style.color = "rgb(0 0 0)";
        }

        // Update current ref
        focusRow.row = row;
        focusRow.boxRef = boxCheck;
        boxCheck.classList.replace("fa-square", "fa-square-check");
        boxCheck.style.color = "rgb(90 40 255)";
        row.style.color = "rgb(90 40 255)";

        // Dispatch event
        window.postMessage(
          {
            type: "NEW_TABLE_ROW_FOCUS",
            svg2m: data,
          },
          window.location.origin
        );
      });

      //   const indexCell = row.insertCell();
      //   indexCell.id = `svg2mIndexCell-${rowNumber}`;
      //   indexCell.innerHTML = `${rowNumber}`;

      keys.forEach((key) => {
        const col = row.insertCell();
        col.innerHTML = data[key] !== undefined ? data[key] : "";
      });
    });

    // post event
    window.postMessage(
      {
        type: "TABLE_RELOAD_DATA",
      },
      window.location.origin
    );
    window.dispatchEvent(
      new CustomEvent("TABLE_RELOAD_DATA", {
        detail: svg2mData,
      })
    );
  }
};

const loadData = async (seri, limit = 200) => {
  // console.log("SERI: ", seri);
  const svg2mData = await axios
    .get("/api/svg2m", {
      params: {
        series: seri,
        limit: limit,
      },
    })
    .then(function (response) {
      // console.log(response);
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
  loadDataToTable(svg2mData);
  // Update current data
  currentData = svg2mData;
};

// init data when page loaded
// loadData(currentSeri);
// Load nearest seri
(async function check() {
  const auth = localStorage.getItem("auth");

  if (!auth) {
    logout();
  }
  try {
    const { user, token } = JSON.parse(auth);
    const values = await axios
      .get("/api/svg2m/series", {
        params: {
          limit: 5,
          id: user._id,
        },
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
    if (!values || values.length === 0) {
      const statusCol = document.getElementById("col-status");
      if (statusCol) {
        statusCol.textContent =
          "Bạn hiện chưa được cấp quyền truy cập vào bất cứ seri nào. Vui lòng liên hệ Admin để thêm các quyền truy cập";
      }
    } else {
      currentSeri = values[0].seri;
      const spanSeri = document.getElementById("current-seri");
      if (spanSeri) {
        spanSeri.textContent = `${currentSeri}`;
      }
      await loadData(currentSeri);
    }
    // console.log(values);
  } catch (error) {
    console.log(error);
    logout();
  }
})();

window.addEventListener("message", async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }
  const { data } = event;

  // handle change marker event
  if (data.type && data.type === "INSERT_TABLE_DATA") {
    // console.log("Insert table");
    const svg2m = data.svg2m;
    // console.log(svg2m.seri.toString() === currentSeri);
    if (svg2m.seri === +currentSeri) {
      currentData.push(svg2m);
      loadDataToTable([svg2m], false);
    }
  }

  if (data.type && data.type === "RELOAD_SERI_TABLE") {
    const { seri, limit } = data;
    currentSeri = seri;
    await loadData(seri, limit || 200);
  }
});
