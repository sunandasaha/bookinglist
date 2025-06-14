const UpBookModel = require("../models/UpcomingBookings");

const getBookings = async (req, res) => {
  try {
    if (!req.headers.hotelid) {
      res.json({
        success: false,
        status: "No hotel ID provided",
        message: "Missing hotel ID",
      });
    } else {
      const startDate = req.headers.date
        ? new Date(req.headers.date)
        : new Date();
      const endDate = new Date(new Date().setDate(startDate.getDate() + 7));
      const hotelId = req.headers.hotelid;

      const chk = await UpBookModel.find({
        hotelId: hotelId,
        fromDate: { $lte: endDate },
        toDate: { $gte: startDate },
      }).select(
        req.user ? "fromDate toDate room booking_id" : "fromDate toDate room"
      );
      res.json({ status: "success", bookings: chk, success: true });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, status: "failed" });
  }
};

module.exports = { getBookings };
