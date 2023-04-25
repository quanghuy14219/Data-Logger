const socket = io("127.0.0.1:1603");

socket.emit("hello", "Hello, server!");

socket.on("hello", function (data) {
  console.log("Received a message from the server:", data);
});

socket.on("new-data", function (data) {
  console.log("new data \n", data);

  const tbody = document.getElementById("tbl_data");

  let begin = 2;
  for (const child of tbody.children) {
    const first = child.querySelector(".first-col");
    if (first) {
      first.textContent = `${begin++}`;
    }
  }

  const tr = document.createElement("tr");
  tbody.insertBefore(tr, tbody.firstChild);
  tr.id = data._id;
  const td = document.createElement("td");
  td.textContent = "1";
  td.classList.add("first-col");

  const index = td.cloneNode(true);

  tr.appendChild(index);
  [
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
  ].forEach((field) => {
    const element = td.cloneNode(true);
    element.textContent = data[field];
    tr.appendChild(element);
  });
});
