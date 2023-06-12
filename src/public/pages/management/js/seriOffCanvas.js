let currentSeri = null;

window.addEventListener("seri-clicked", (event) => {
  const seri = event.detail;
  currentSeri = seri;

  const showBtn = document.getElementById("btn-show-seri-pane");
  showBtn && showBtn.click();

  const label = document.getElementById("offcanvasSeriLabel");
  label.textContent = `SERI: ${seri.seri}`;

  const id = document.getElementById("seri-pane-inf-id");
  id.textContent = seri._id;

  const createAt = document.getElementById("seri-pane-inf-createAt");
  createAt.textContent = seri.createAt;

  const unit = document.getElementById("seri-new-unit-input");
  unit.value = seri.unit || "";

  const phone = document.getElementById("seri-new-contact-input");
  phone.value = seri.phone || "";
});

const handleChangeSeriInfo = () => {
  const unit = document.getElementById("seri-new-unit-input").value;
  const phone = document.getElementById("seri-new-contact-input").value;
  const btnChangeInf = document.getElementById("btn-change-seri-info");

  if (unit !== currentSeri.unit || phone !== currentSeri.phone) {
    btnChangeInf.style.display = "inline-block";
  } else {
    btnChangeInf.style.display = "none";
  }
};

const changeSeriInfo = async () => {
  const id = document.getElementById("seri-pane-inf-id")?.textContent;
  const unit = document.getElementById("seri-new-unit-input").value;
  const phone = document.getElementById("seri-new-contact-input").value;
  if (id) {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      logout();
    }
    try {
      const { user, token } = JSON.parse(auth);
      await axios
        .put(
          `/api/series`,
          {
            id: id,
            unit: unit,
            contact: phone,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then(async (res) => {
          const btnChangeInf = document.getElementById("btn-change-seri-info");
          btnChangeInf.style.display = "none";
          currentSeri.unit = unit;
          currentSeri.phone = phone;
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      logout();
    }
  }
};
