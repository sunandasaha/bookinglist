const GuestModel = require("../models/GuestBooking");

const dailyCheckin = async (req, res) => {
  date = new Date(new Date().toISOString().substring(0, 10));
  await GuestModel.updateMany({ fromDate: date, status: 1 }, { status: 11 });
  res.json({ success: true });
};

// const testCron = async (req, res) => {
//   const bok = await GuestModel.findById("BK3104653316530");
//   sendEmail(bok);
//   res.json({ success: true });
// };

module.exports = { dailyCheckin };
