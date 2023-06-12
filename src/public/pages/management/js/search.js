document.addEventListener("click", (event) => {
  const searchBox = document.getElementById("search-box");
  if (searchBox && !searchBox.contains(event.target)) {
    const searchOptions = document.getElementById("search-options");
    if (searchOptions) {
      searchOptions.style.display = "none";
    }
  }
});

const showOptions = async () => {
  const searchOptions = document.getElementById("search-options");
  if (searchOptions) {
    searchOptions.style.display = "block";
  }
  await loadOptions();
};

const loadOptions = async () => {
  const input = document.getElementById("input-seri");
  const prefix = input?.value;
  const searchOptions = document.getElementById("search-options");
  if (searchOptions) {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      const values = await axios
        .get("/api/svg2m/series", {
          params: {
            prefix: prefix,
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

      if (values) {
        // Clear
        searchOptions.innerHTML = "";

        values.forEach((value) => {
          const aTag = document.createElement("a");
          aTag.textContent = `${value.seriStr} - ${value.unit || "?"}`;
          searchOptions.appendChild(aTag);
          aTag.style.display = "block";
          aTag.addEventListener("click", () => {
            input.value = "";
            searchOptions.style.display = "none";

            const userId =
              document.getElementById("action-pane-inf-id").textContent;
            putSeri(userId, value.seri, true);

            window.dispatchEvent(
              new CustomEvent("new-seri-access", {
                detail: {
                  userId: userId,
                  seri: value.seri,
                },
              })
            );
          });
        });
      }
    } catch (error) {
      console.log(error);
      logout();
    }
  }
};

const putSeri = async (userId, seri, push = true) => {
  if (userId && seri) {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      const result = await axios
        .put(
          `/api/user/series`,
          {
            id: userId,
            series: [seri],
            push: push,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then((res) => {
          console.log(res);
          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
      return result;
    } catch (error) {
      logout();
    }
  }
};
