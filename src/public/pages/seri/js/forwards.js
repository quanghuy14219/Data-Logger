// Forward event new data from socket to table
window.addEventListener("message", async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }
  const { data } = event;

  // forward
  if (data.type && data.type === "NEW_SVG2M_DATA") {
    console.log(data);
    window.postMessage(
      {
        type: "INSERT_TABLE_DATA",
        svg2m: data.svg2m,
      },
      window.location.origin
    );
  }
});

// Forward event click row from socket to table
window.addEventListener("message", async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }
  const { data } = event;

  // forward
  if (data.type && data.type === "NEW_TABLE_ROW_FOCUS") {
    const { svg2m } = data;
    window.postMessage(
      {
        type: "CHANGE_MARKER",
        latitude: svg2m.latitude,
        longitude: svg2m.longitude,
        replace: true,
        svg2mData: svg2m,
      },
      window.location.origin
    );
  }
});

window.addEventListener("message", async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }
  const { data } = event;

  // forward
  if (data.type && data.type === "TABLE_RELOAD_DATA") {
    window.postMessage(
      {
        type: "LOAD_CHART_DATA",
      },
      window.location.origin
    );
  }
});
