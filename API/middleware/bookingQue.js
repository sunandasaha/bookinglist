const busy = new Map();

const setFalse = (id) => {
  busy.set(id, false);
};

const bookingHold = async (req, res, next) => {
  const data = req.body;
  const chk = busy.get(data.hotelId);
  while (chk) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  busy.set(data.hotelId, true);
  next();
};

module.exports = {
  setFalse,
  bookingHold,
};
