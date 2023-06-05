const events = require("events");

// Create an eventEmitter object
const emitter = new events.EventEmitter();

module.exports = {
  emitter,
};
