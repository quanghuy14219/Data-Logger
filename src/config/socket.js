const socketIO = require("socket.io");

const socketIORef = {
  current: null,
  clients: {},
};

export const openSocket = (server, options = {}) => {
  const io = socketIO(server, options);
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
    socket.on("disconnect", function (socket) {
      if (socketIORef.clients[id]) {
        delete socketIORef.clients[id];
      }
      console.log("Client goodbye");
    });
  });
};

export const dispatchNewDataEvent = (data) => {
  if (socketIORef.current) {
    Object.values(socketIORef.clients).forEach((socket) => {
      socket.emit("new-data", data);
    });
  }
};

export default socketIORef;
