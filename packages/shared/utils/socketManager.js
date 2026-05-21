let io = null;

export function setIO(socketIo) {
  io = socketIo;
}

export function getIO() {
  return io;
}

export default {
  setIO,
  getIO
};
