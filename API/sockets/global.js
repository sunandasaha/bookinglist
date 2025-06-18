let io = null;
let hid = null;

const setio = (ioins, hidins) => {
  io = ioins;
  hid = hidins;
};

const getio = () => {
  return io;
};

const sendNewBook = (id, bok) => {
  const sid = hid.get(id);
  if (io && sid) {
    io.to(sid).emit("new-booking", bok);
  }
};

module.exports = {
  setio,
  getio,
  sendNewBook,
};
