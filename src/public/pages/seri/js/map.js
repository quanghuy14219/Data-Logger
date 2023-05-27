let map;
const markers = {};
const currentCenter = {
  lat: 0,
  lng: 0,
};

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
  marker.infoWindow = infoWindow;

  infoWindow.open(map, marker);

  marker.addListener("click", function () {
    infoWindow.open(map, marker);
  });

  const id = makeId(latitude, longitude);
  markers[id] = marker;
  currentCenter.lat = latitude;
  currentCenter.lng = longitude;
}

function deleteMarkerById(id) {
  const marker = markers[id];
  if (marker) {
    marker.setMap(null);
    marker.infoWindow.close();
    delete markers[id];
  }
}

function deleteMarkerByCenter(latitude, longitude) {
  const id = makeId(latitude, longitude);
  deleteMarkerById(id);
}

function getContent(svg2mData) {
  const {
    seri,
    date,
    time,
    longitude,
    latitude,
    mode,
    draDoseRate,
    draDose,
    neutron,
    actAlpha,
    actBeta,
    actGamma,
  } = svg2mData;

  let info = ` 
    <div class="marker">
      <h4 class="marker-header">Thiết bị mã số ${seri}</h4>
      <div class="marker-content">
        <ul>
          <li class="marker-time">Thời điểm: ${time} ${date}</li>
          <li class="marker-draDoseRate">DRA Dose Rate: ${draDoseRate} (µSv/h)</li>
          <li class="marker-draDose">DRA Dose: ${draDose} (µSv)</li>
          ${
            mode === 1
              ? ` 
            <li class="marker-actAlpha">Act Alpha: ${actAlpha} (CPS)</li>
            <li class="marker-actBeta">Act Beta: ${actBeta} (CPS)</li>
            <li class="marker-actGamma">Act Gamma: ${actGamma} (µSv/h)</li>
            `
              : ""
          } 
          
        </ul>
      </div>
    </div>
  `;

  return info;
}

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("map"), {
    center: { lat: 16, lng: 108 },
    zoom: 5.5,
  });
}

window.addEventListener("message", async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) {
    return;
  }
  const { data } = event;

  // handle change marker event
  if (data.type && data.type === "CHANGE_MARKER") {
    const { latitude, longitude, replace, svg2mData } = data;
    // Init map if necessary
    if (!map) {
      map = await initMap();
    }

    if (!longitude || !latitude) {
      console.log("Missing longitude or latitude");
      deleteMarkerByCenter(currentCenter.lat, currentCenter.lng);
      return;
    }

    if (replace !== false) {
      deleteMarkerByCenter(currentCenter.lat, currentCenter.lng);
    }

    map.setCenter({ lat: latitude, lng: longitude });
    addMarker(
      latitude,
      longitude,
      makeId(latitude, longitude),
      getContent(svg2mData)
    );
  }

  // handle delete marker event
  if (data.type && data.type === "DELETE_MARKER") {
    const { latitude, longitude, id } = data;
    // Init map if necessary
    if (!map) {
      map = await initMap();
    }

    if (id) {
      deleteMarkerById(id);
      return;
    }

    if (!longitude || !latitude) {
      console.log("Missing longitude or latitude");
      return;
    }
    deleteMarkerByCenter(latitude, longitude);
  }
});

initMap();
