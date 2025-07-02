const GuestModel = require("../models/GuestBooking");
const UpBookModel = require("../models/UpcomingBookings");
const { removeBookings } = require("../sockets/global");

const ids = new Map();

const addTimeOut = (id) => {
  const sid = setTimeout(async () => {
    const bok = await GuestModel.findById(id);
    if (bok && bok.status === 0) {
      for (let i = 0; i < bok.ub_ids.length; i++) {
        await UpBookModel.findByIdAndDelete(bok.ub_ids[i]);
      }
      await GuestModel.findByIdAndDelete(id);
      removeBookings(bok.hotelId, id);
      console.log("Booking: " + id + " deleted");
    }
  }, 300000);
  ids.set(id, sid);
};

const deleteTimeout = (id) => {
  const sid = ids.get(id);
  if (sid) clearTimeout(sid);
};

module.exports = { addTimeOut, deleteTimeout };
