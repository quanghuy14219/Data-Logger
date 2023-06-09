const _Map_ = {
  ref: null,
  center: {
    lat: 0,
    lng: 0,
  },
  markers: {},
};

const MAX_TIME_LEFT = 60000;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  _Map_.ref = new Map(document.getElementById("map"), {
    center: { lat: 16, lng: 108 },
    zoom: 5.5,
  });
}
initMap();

function getContent(svg2mData, active = false) {
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
    <div class="marker marker-info-${active ? "green" : "red"
    }" id="marker-info-${seri}">
      <h4 class="marker-header">ID: ${seri}</h4>
      <div class="marker-content">
        <ul>
          <li class="marker-time">Thời điểm: ${time} ${date}</li>
          <li class="marker-draDoseRate">DRA Dose Rate: ${draDoseRate} (µSv/h)</li>
          <li class="marker-draDose">DRA Dose: ${draDose} (µSv)</li>
          ${mode === 1
      ? ` 
            <li class="marker-actAlpha">Act Alpha: ${actAlpha} (CPS)</li>
            <li class="marker-actBeta">Act Beta: ${actBeta} (CPS)</li>
            <li class="marker-actGamma">Act Gamma: ${actGamma} (µSv/h)</li>
            `
      : ""
    } 
          
        </ul>
      </div>
      <a class="marker-detail" href="${window.location.origin
    }?s=${seri}">Đến trang xem dữ liệu</a>
    </div>
  `;

  return info;
}

async function updateMarker(svg2m) {
  const content = getContent(svg2m);
  const { ref: map, center, markers } = _Map_;
  const { latitude, longitude, seriStr: seri } = svg2m;
  if (!latitude || !longitude) {
    console.log("Missing longitude or latitude");
    return;
  }
  if (!seri) {
    console.log("Missing seri");
    return;
  }
  if (!map) {
    console.log("Map not initialized");
    return;
  }
  if (!markers[seri]) {
    const marker = new google.maps.Marker({
      position: { lat: svg2m.latitude, lng: svg2m.longitude },
      map: map,
      title: seri,
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });
    marker.data = svg2m;

    marker.getControlElement = () =>
      document.getElementById(`marker-control-${seri}`);

    const infoWindow = new google.maps.InfoWindow({
      content: content,
    });
    // open by default
    infoWindow.open(map, marker);
    marker.infoWindow = infoWindow;
    marker.addListener("click", function () {
      infoWindow.open(map, marker);
    });
    markers[svg2m.seriStr] = marker;

    const newDate = toDate(svg2m.time, svg2m.date);
    const timeLeft = Date.now() - newDate.getTime();
    if (timeLeft >= 0 && timeLeft < MAX_TIME_LEFT) {
      marker.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");

      infoWindow.setContent(getContent(svg2m, true));

      const markerControlElement = marker.getControlElement();
      if (markerControlElement) {
        markerControlElement.classList.replace(
          "marker-control-red",
          "marker-control-green"
        );
      }

      marker.timeOut = setTimeout(() => {
        marker.timeOut = null;
        marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");

        infoWindow.setContent(getContent(svg2m, false));

        if (markerControlElement) {
          markerControlElement.classList.replace(
            "marker-control-green",
            "marker-control-red"
          );
        }
      }, MAX_TIME_LEFT - timeLeft);
    }
  } else {
    const marker = markers[svg2m.seriStr];
    const infoWindow = marker.infoWindow;
    const currentData = marker.data;

    const curDate = toDate(currentData.time, currentData.date);
    const newDate = toDate(svg2m.time, svg2m.date);

    if (newDate.getTime() > curDate.getTime()) {
      marker.setPosition(new google.maps.LatLng(latitude, longitude));
      infoWindow.setContent(content);
      marker.data = svg2m;

      if (marker.timeOut) {
        clearTimeout(marker.timeOut);
      }

      const timeLeft = Date.now() - newDate.getTime();
      console.log("TimeLeft", timeLeft);
      if (timeLeft >= 0 && timeLeft < MAX_TIME_LEFT) {
        infoWindow.setContent(getContent(svg2m, true));

        const markerControlElement = marker.getControlElement();
        if (markerControlElement) {
          markerControlElement.classList.replace(
            "marker-control-red",
            "marker-control-green"
          );
        }

        marker.setIcon(
          "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        );

        marker.timeOut = setTimeout(() => {
          marker.timeOut = null;
          marker.setIcon(
            "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
          );
          infoWindow.setContent(getContent(svg2m, false));

          if (markerControlElement) {
            markerControlElement.classList.replace(
              "marker-control-green",
              "marker-control-red"
            );
          }
        }, MAX_TIME_LEFT - timeLeft);
      }
    }
  }

  // center.lat = svg2m.latitude;
  // center.lng = svg2m.longitude;
}

function toDate(time, day) {
  var timeParts = time.split(":");
  var hour = parseInt(timeParts[0]);
  var minute = parseInt(timeParts[1]);
  var second = parseInt(timeParts[2]);

  var dateParts = day.split("/");
  var day = parseInt(dateParts[0]);
  var month = parseInt(dateParts[1]) - 1;
  var year = parseInt(dateParts[2]);

  var dateObject = new Date(year, month, day, hour, minute, second);
  return dateObject;
}

function deleteMarker(seri) {
  const { markers } = _Map_;
  const marker = markers[seri];
  if (marker) {
    marker.setMap(null);
    marker.infoWindow.close();
    delete markers[seri];
  }
}

window.addEventListener("new-svg2m-data", async (event) => {
  const svg2m = event.detail;
  const { seriStr } = svg2m;
  const marker = markers[seriStr];
  if (marker) {
    updateMarker(svg2m);
  }
});

window.addEventListener("update-markers", async (event) => {
  const records = event.detail;
  if (!_Map_.ref) {
    await initMap();
  }

  // records[0] = {
  //   ...records[0],
  //   time: "21:03:00",
  //   date: "30/06/2023",
  // };

  records.forEach((record) => {
    const mR = {
      ...record,
      date: record.date.replace("2024", "2023"),
    };
    updateMarker(mR);
  });

  // const mR = {
  //   ...records[0],
  //   time: "20:45:00",
  //   date: "30/06/2023",
  // };
  // console.log(mR);
  // updateMarker(mR);
});

window.addEventListener("seri-clicked", (event) => {
  const { ref: map, markers } = _Map_;
  const seri = event.detail;
  const marker = markers[seri.seriStr];
  const infoWindow = marker.infoWindow;
  const svg2m = marker.data;
  map.setCenter({ lat: svg2m.latitude, lng: svg2m.longitude });
  infoWindow.open(map, marker);
  map.setZoom(8.0);
});
