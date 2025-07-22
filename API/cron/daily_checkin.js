const GuestModel = require("../models/GuestBooking");

const dailyCheckin = async (req, res) => {
  date = new Date(new Date().toISOString().substring(0, 10));
  await GuestModel.updateMany({ fromDate: date, status: 1 }, { status: 11 });
  res.json({ success: true });
};

module.exports = { dailyCheckin };
