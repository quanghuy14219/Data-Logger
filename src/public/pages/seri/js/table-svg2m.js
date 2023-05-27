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
      boxCheck.style.color = "#66f948";
      row.addEventListener("click", (event) => {
        // Check current row is focused
        if (focusRow.boxRef && focusRow.boxRef === boxCheck) {
          return;
        }

        // Remove current check box
        if (focusRow.boxRef) {
          focusRow.boxRef.classList.replace("fa-square-check", "fa-square");
        }

        // Update current ref
        focusRow.boxRef = boxCheck;
        boxCheck.classList.replace("fa-square", "fa-square-check");

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
  }
};

const loadData = async (seri, limit = 200) => {
  const svg2mData = await axios
    .get("/api/svg2m", {
      params: {
        series: seri,
        limit: limit,
      },
    })
    .then(function (response) {
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
loadData(currentSeri);

window.addEventListener("message", async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }
  const { data } = event;

  // handle change marker event
  if (data.type && data.type === "INSERT_TABLE_DATA") {
    const svg2m = data.svg2m;
    if (svg2m.seri.toString() === currentSeri) {
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
