const GuestModel = require("../models/GuestBooking");
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
      const startDate = req.headers.sdate
        ? new Date(req.headers.sdate)
        : new Date();
      const endDate = new Date(new Date().setDate(startDate.getDate() + 7));
      const hotelId = req.headers.hotelid;

      const chk = await UpBookModel.find({
        hotelId: hotelId,
        fromDate: { $lte: endDate },
        toDate: { $gte: startDate },
      }).select(
        req.user
          ? "fromDate toDate room confirmed booking_id"
          : "fromDate toDate room"
      );
      res.json({ status: "success", bookings: chk, success: true });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, status: "failed" });
  }
};

const updateBooking = async (req, res) => {
  const data = req.body;
  if (!data._id || data.res) {
    res.json({ success: false, status: "no id or responce" });
  } else {
    try {
      const book = await GuestModel.findById(data._id);
      if (!book) {
        res.json({ success: false, status: "failed" });
      } else {
        if (data.res) {
          for (let i = 0; i < book.ub_ids.length; i++) {
            await UpBookModel.findByIdAndUpdate(book.ub_ids[i], {
              confirmed: true,
            });
          }
          book.status = 1;
          await book.save();
        } else {
          for (let i = 0; i < book.ub_ids.length; i++) {
            await UpBookModel.findByIdAndDelete(book.ub_ids[i]);
          }
          book.ub_ids = [];
          book.status = 2;
          book.save();
        }
        res.json({ success: true, status: "success" });
      }
    } catch (error) {
      res.json({ success: false, status: "failed" });
    }
  }
};

const cancelBooking = async (req, res) => {
  const { id, can } = req.body;
  if (!id) {
    res.json({ success: false, status: "no id" });
  } else {
    try {
      const book = await GuestModel.findById(id);
      console.log(book);

      if (!book) {
        res.json({ success: false, status: "nfailed" });
      } else {
        for (let i = 0; i < book.ub_ids.length; i++) {
          await UpBookModel.findByIdAndDelete(book.ub_ids[i]);
        }
        book.ub_ids = [];
        book.status = can ? 3 : 4;
        book.save();
      }
      res.json({ success: true, status: "success" });
    } catch (error) {
      res.json({ success: false, status: "failed" });
    }
  }
};

module.exports = { getBookings, updateBooking, cancelBooking };
