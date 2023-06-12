import { jwtService } from "../services";

const socketIORef = {
  current: null,
  clients: {},
};

const dispatchSocketStateToAdmins = (client, state = "online") => {
  Object.values(socketIORef.clients).forEach((socket) => {
    const role = socket?.auth?.role;
    if (role && role === "ADMIN" && client.auth) {
      socket.emit("client-change-state", {
        user: client.auth,
        state: state,
      });
    }
  });
};

export const configSocket = (io) => {
  socketIORef.current = io;

  console.log("Socket opened");

  io.on("connection", function (socket) {
    const id = socket.id;
    socketIORef.clients[id] = socket;
    socket.emit("hello", {
      greeting: "Hello Client",
    });

    socket.on("hello", function (message) {
      console.log(message);
    });

    socket.on("disconnect", function () {
      if (socketIORef.clients[id]) {
        dispatchSocketStateToAdmins(socket, "offline");
        delete socketIORef.clients[id];
      }
      console.log("Client goodbye");
    });

    socket.on("list-client", function () {
      if (socket.auth) {
        const users = Object.values(socketIORef.clients)
          .filter((client) => client.auth)
          .map((client) => client.auth);
        socket.emit("list-client", users);
      }
    });

    socket.on("authorization", function (token) {
      if (!token) {
        socket.emit("authorization", {
          err: "Token can not empty",
          code: 400,
        });
        return;
      }
      const jwtUser = jwtService.verifyToken(token);
      if (!jwtUser) {
        socket.emit("authorization", {
          err: "Token invalid",
          code: 400,
        });
        return;
      }
      socket.auth = jwtUser;
      dispatchSocketStateToAdmins(socket);
      // console.log(jwtUser);
      // Success
      socket.emit("authorization", {
        code: 200,
        msg: "Authentication successfully",
      });
    });
  });
};

export const dispatchNewDataEvent = (data) => {
  if (socketIORef.current) {
    Object.values(socketIORef.clients).forEach((socket) => {
      socket.emit("new-data", data);
      // console.log(socket);
    });
  }
};

export const dispatchNewAccountEvent = (account) => {
  Object.values(socketIORef.clients).forEach((socket) => {
    const role = socket?.auth?.role;
    if (role && role === "ADMIN") {
      socket.emit("new-account", {
        account: account,
      });
    }
  });
};

export const dispatchNewSeriEvent = (seri) => {
  Object.values(socketIORef.clients).forEach((socket) => {
    const role = socket?.auth?.role;
    if (role && role === "ADMIN") {
      socket.emit("new-seri", {
        seri: seri,
      });
    }
  });
};

export const dispatchDeleteAccountEvent = (id) => {
  Object.values(socketIORef.clients).forEach((socket) => {
    const role = socket?.auth?.role;
    if (role && role === "ADMIN") {
      socket.emit("delete-account", {
        _id: id,
      });
    }
  });
  dispatchLogoutEvent(id);
};

export const dispatchLogoutEvent = (id) => {
  Object.values(socketIORef.clients).forEach((socket) => {
    const _id = socket?.auth?._id;
    if (_id === id.toString()) {
      socket.emit("force-logout");
    }
  });
};

export const dispatchChangeInfoEvent = (account) => {
  Object.values(socketIORef.clients).forEach((socket) => {
    const role = socket?.auth?.role;
    if (role && role === "ADMIN") {
      socket.emit("change-info", {
        account: account,
      });
    }
  });
};

export const dispatchChangeSeriInfoEvent = (seri) => {
  Object.values(socketIORef.clients).forEach((socket) => {
    const role = socket?.auth?.role;
    if (role && role === "ADMIN") {
      socket.emit("change-seri-info", {
        seri: seri,
      });
    }
  });
};

export const dispatchChangeSeriesEvent = (account) => {
  Object.values(socketIORef.clients).forEach((socket) => {
    const role = socket?.auth?.role;
    if (role && role === "ADMIN") {
      socket.emit("change-series", {
        account: account,
      });
    }
  });
};

export default socketIORef;
