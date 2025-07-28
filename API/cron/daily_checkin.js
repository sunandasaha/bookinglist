const GuestModel = require("../models/GuestBooking");

const dailyCheckin = async (req, res) => {
  date = new Date(new Date().toISOString().substring(0, 10));
  await GuestModel.updateMany({ fromDate: date, status: 1 }, { status: 11 });
  res.json({ success: true });
};

const dailyChkOut = async (req, res) => {
  date = new Date(new Date().toISOString().substring(0, 10));
  const bookings = await GuestModel.find({
    status: { $in: [1, 11] },
    toDate: { $lte: date },
  });
  res.json({ success: true });
};

module.exports = { dailyCheckin };
