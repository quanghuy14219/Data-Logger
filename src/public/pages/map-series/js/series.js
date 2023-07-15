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
  const seriesContainer = document.getElementById("list-series");
  seriesContainer &&
    series.forEach((seri) => {
      const li = document.createElement("li");
      li.textContent = seri.seriStr + " - " + (seri.unit || "?");
      li.setAttribute("title", "Phone: " + (seri.phone || "?"));
      li.addEventListener("click", () => {
        window.dispatchEvent(
          new CustomEvent("seri-clicked", {
            detail: seri,
          })
        );
      });
      li.id = `marker-control-${seri.seriStr}`;
      li.classList.add("marker-control-red");
      seriesContainer.appendChild(li);
    });
}

window.addEventListener("load", async (event) => {
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
});

window.addEventListener("authentication complete", async (event) => {
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
  window.dispatchEvent(
    new CustomEvent("update-markers", {
      detail: records,
    })
  );
});
