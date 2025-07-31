const GuestModel = require("../models/GuestBooking");
const { deleteFile } = require("../utils/upload");

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
  });
  for (let i = 0; i < bookings.length; i++) {
    const bok = bookings[i];
    await deleteFile(bok.advance_ss);
    bok.advance_ss = undefined;
    bok.status = 12;
    bok.amountPaid = bok.totalPrice - bok.advanceAmount - (bok.agentCut || 0);
    await bok.save();
  }
  res.json({ success: true });
};

module.exports = { dailyCheckin, dailyChkOut };
