const GuestModel = require("../models/GuestBooking");
const { sendEmail } = require("../utils/emailService");

const dailyCheckin = async () => {
  date = new Date(new Date().toISOString().substring(0, 10));
  await GuestModel.updateMany({ fromDate: date, status: 1 }, { status: 11 });
};

const testCron = async (req, res) => {
  const bok = await GuestModel.findById("BK3104653316530");
  sendEmail(bok);
  res.json({ success: true });
};

module.exports = { testCron };
