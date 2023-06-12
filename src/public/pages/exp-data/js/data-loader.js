const fetchData = async (page, limit) => {
  try {
    const res = await fetch(`/api/data/pagination?page=${page}&limit=${limit}`);
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const renderTable = (svg2mData, clear = true, indexStart = 1) => {
  const tblBody = document.getElementById("tbl_data");
  // clear table
  if (clear && tblBody) {
    const rowCount = tblBody.rows.length;
    for (let i = rowCount - 1; i >= 0; i--) {
      tblBody.deleteRow(i);
    }
  }
  // render table
  const keys = [
    "seri",
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
  if (tblBody && svg2mData) {
    svg2mData.forEach((data, index) => {
      const rowNumber = indexStart + index;
      const row = tblBody.insertRow();
      row.id = `svg2mRow${rowNumber}`;
      const indexCell = row.insertCell();
      indexCell.id = `svg2mIndexCell-${rowNumber}`;
      indexCell.innerHTML = `${rowNumber}`;
      const cells = {};
      keys.forEach((key) => {
        cells[key] = row.insertCell();
      });
      Object.keys(cells).forEach((key) => {
        cells[key].innerHTML = data[key] === undefined ? "" : data[key];
      });
    });
  }
};

const renderPagination = (page, limit, count, totalPages) => {
  const pageInput = document.getElementById("pagination-page-input");
  const pageLimit = document.getElementById("pagination-page-limit");
  const pageStatistic = document.getElementById("pagination-page-statistic");
  const pageFirst = document.getElementById("pagination-first");
  const pagePrevious = document.getElementById("pagination-previous");
  const pageNext = document.getElementById("pagination-next");
  const pageLast = document.getElementById("pagination-last");

  if (page > totalPages) {
    pageInput.value = `${totalPages}`;
    pageInput.dispatchEvent(new Event("change"));
    return;
  }
  pageInput.value = `${page}`;
  pageInput.setAttribute("max", `${totalPages}`);

  pageLimit.value = `${limit}`;
  pageLimit.dispatchEvent(new Event("change"));

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(startIndex + limit - 1, count);
  pageStatistic.innerHTML = `Hiển thị ${startIndex} - ${endIndex} trên tổng số ${count}`;

  pageFirst.disabled = page === 1;
  pagePrevious.disabled = page === 1;
  pageNext.disabled = page === totalPages;
  pageLast.disabled = page === totalPages;
};

const loadDataToTable = async () => {
  // Get page and limit in current
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = parseInt(urlParams.get("page"));
  const limitParam = parseInt(urlParams.get("limit"));

  const data = await fetchData(pageParam, limitParam);
  const { results, count, totalPages, page, limit } = data;
  const startIndex = (page - 1) * limit + 1;
  history.pushState(
    {
      reload: false,
    },
    null,
    `${window.location.origin}${window.location.pathname}?page=${page}&limit=${limit}`
  );

  renderTable(results, true, startIndex);
  renderPagination(page, limit, count, totalPages);
};

// Load on first time page access
loadDataToTable();

window.addEventListener(
  "message",
  (event) => {
    if (event.source !== window || event.origin !== window.location.origin) {
      return;
    }

    const { data } = event;
    if (data.type && data.type === "CHANGE_PAGE") {
      const { lastPage, newPage, currentLimit } = data;
      history.pushState(
        {
          reload: true,
        },
        null,
        `${window.location.origin}${window.location.pathname}?page=${newPage}&limit=${currentLimit}`
      );
      loadDataToTable();
    }
    if (data.type && data.type === "CHANGE_LIMIT") {
      const { lastLimit, newLimit, currentPage } = data;
      history.pushState(
        {
          reload: true,
        },
        null,
        `${window.location.origin}${window.location.pathname}?page=${currentPage}&limit=${newLimit}`
      );
      loadDataToTable();
    }
    if (data.type && data.type === "RELOAD_TABLE") {
      loadDataToTable();
    }
  },
  false
);
