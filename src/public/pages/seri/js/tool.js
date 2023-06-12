window.addEventListener("authentication complete", (event) => {
    const auth = event.detail;
    socket.auth = auth;
    const { user, token } = auth;
    console.log(user);
    window.addEventListener("load", () => {
        document.getElementById("tab-pane-taikhoan").textContent = user.username;
        document.getElementById("tab-pane-vaitro").textContent = user.role;
        document.getElementById("tab-pane-donvi").textContent = user.unit;
        document.getElementById("tab-pane-sdt").textContent = user.phone;

    })
    if (user.role !== "ADMIN") {
        document.getElementById("tabpane-delete-account-container").style.display = "none";
    }

});