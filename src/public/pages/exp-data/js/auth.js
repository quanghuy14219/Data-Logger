const logout = () => {
  localStorage.removeItem("auth");
  window.location.assign(
    `${window.location.origin}/login?redirect=${window.location.href}`
  );
};

window.addEventListener("storage", function (event) {
  if (event.key === "auth") {
    if (event.newValue === null) {
      logout();
    }
  }
});

window.addEventListener("logout", function (event) {
  console.log(event);
  logout();
});

//  Check authentication status
(async () => {
  const auth = localStorage.getItem("auth");
  if (!auth) {
    logout();
  }
  if (auth) {
    try {
      const { user, token } = JSON.parse(auth);
      fetch("/api/user/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.err) {
            logout();
          }
          if (!data.err) {
            if (!data?.user?.role || data.user.role !== "ADMIN") {
              window.location.assign(`${window.location.origin}/svg2m`);
            }
            localStorage.setItem("auth", JSON.stringify(data));
            window.dispatchEvent(
              new CustomEvent("authentication complete", {
                detail: data,
              })
            );
          }
        });
    } catch (error) {
      logout();
    }
  }
})();
