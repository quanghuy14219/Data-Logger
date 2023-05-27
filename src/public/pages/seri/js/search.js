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
    const values = await axios
      .get("/api/svg2m/series", {
        params: {
          prefix: prefix,
          limit: 5,
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
        aTag.textContent = value;
        searchOptions.appendChild(aTag);
        aTag.style.display = "block";
        aTag.addEventListener("click", () => {
          input.value = "";
          window.postMessage(
            {
              type: "RELOAD_SERI_TABLE",
              seri: value,
            },
            window.location.origin
          );
          currentSeri = value;
          searchOptions.style.display = "none";
          const spanSeri = document.getElementById("current-seri");
          if (spanSeri) {
            spanSeri.textContent = value;
          }
        });
      });
    }
  }
};
