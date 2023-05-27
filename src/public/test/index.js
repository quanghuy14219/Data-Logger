let map;
let markers = {};

function makeId(latitude, longitude) {
  return `${latitude}&${longitude}`;
}

function addMarker(latitude, longitude, title, content) {
  if (!map) {
    console.log("Map not initialized");
    return;
  }
  const marker = new google.maps.Marker({
    position: { lat: latitude, lng: longitude },
    map: map,
    title: title,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: content,
  });

  marker.addListener("click", function () {
    infoWindow.open(map, marker);
  });

  const id = makeId(latitude, longitude);
  markers[id] = marker;
}

function deleteMarkerById(id) {
  const marker = markers[id];
  if (marker) {
    marker.setMap(null);
    delete markers[id];
  }
}

function deleteMarkerByCenter(latitude, longitude) {
  const id = makeId(latitude, longitude);
  deleteMarkerById(id);
}

function getContent(latitude, longitude) {
  return `${latitude}&${longitude}`;
}

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });

  // addMarker(-34.397, 150.644, "test place", getContent(-34.397, 150.644));
}

window.addEventListener("message", async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }
  const { data } = event;
  if (data.type && data.type === "CHANGE_MARKER") {
    const { latitude, longitude, replace } = data;
    // Init map if necessary
    if (!map) {
      map = await initMap();
    }

    if (!longitude || !latitude) {
      console.log("Missing longitude or latitude");
      return;
    }

    if (replace !== false) {
      const currentCenter = map.getCenter();
      const currentLatitude = currentCenter.lat();
      const currentLongitude = currentCenter.lng();
      deleteMarkerByCenter(currentLatitude, currentLongitude);
    }

    map.setCenter(latitude, longitude);
    addMarker(
      latitude,
      longitude,
      makeId(latitude, longitude),
      getContent(latitude, longitude)
    );
  }
});

initMap();
