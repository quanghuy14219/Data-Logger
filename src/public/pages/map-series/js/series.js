function getUser() {
  const auth = localStorage.getItem("auth");
  if (!auth) {
    return null;
  }
  try {
    const user = JSON.parse(auth);
    return user;
  } catch (error) {
    return null;
  }
}

function renderSeries(series) {
  const updateInfo = (li, seri) => {
    li.textContent = seri.seriStr + " - " + (seri.unit || "?");
    li.setAttribute("title", "Phone: " + (seri.phone || "?"));
    li.onclick = () => {
      window.dispatchEvent(
        new CustomEvent("seri-clicked", {
          detail: seri,
        })
      );
    };
  };
  const seriesContainer = document.getElementById("list-series");
  seriesContainer &&
    series.forEach((seri) => {
      // Prevent duplicate
      const element = document.getElementById(`marker-control-${seri.seriStr}`);

      if (element) {
        updateInfo(element, seri);
        return;
      } else {
        const li = document.createElement("li");
        updateInfo(li, seri);
        li.id = `marker-control-${seri.seriStr}`;
        li.classList.add("marker-control-red");
        seriesContainer.appendChild(li);
      }
    });
}

async function fetchAndLoadSeries() {
  const { user, token } = getUser();
  if (!token) {
    logout();
  }
  const values = await axios
    .get("/api/svg2m/series", {
      params: {
        id: user._id,
      },
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
  renderSeries(values);
}

async function fetchSeriesRecords() {
  const { user, token } = getUser();
  if (!token) {
    logout();
  }
  const records = await axios
    .get("/api/svg2m/records", {
      params: {
        id: user._id,
      },
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
  return records;
}

window.addEventListener("load", async (event) => {
  await fetchAndLoadSeries();
  const records = await fetchSeriesRecords();
  window.dispatchEvent(
    new CustomEvent("update-markers", {
      detail: records,
    })
  );
});

window.addEventListener("reload-controls", async (event) => {
  await fetchAndLoadSeries();
});
