const GuestModel = require("../models/GuestBooking");

const dailyCheckin = async (req, res) => {
  date = new Date(new Date().toISOString().substring(0, 10));
  await GuestModel.updateMany({ fromDate: date, status: 1 }, { status: 11 });
  res.json({ success: true });
};

const dailyChkOut = async (req, res) => {
  date = new Date(new Date().toISOString().substring(0, 10));
  const bookings = await GuestModel.find({
    status: 11,
    toDate: { $lte: date },
    advance_ss: { $exists: true },
  }).select("advance_ss");
  res.json({ success: true, bookings });
};

module.exports = { dailyCheckin };
