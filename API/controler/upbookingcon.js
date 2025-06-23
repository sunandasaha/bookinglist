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
        ? new Date(req.headers.sdate.substring(0, 10))
        : new Date();
      const endDate = new Date(
        new Date(new Date().setDate(startDate.getDate() + 7))
          .toISOString()
          .substring(0, 10)
      );
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
      if (!book) {
        res.json({ success: false, status: "failed" });
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

const checkoutBooking = async (req, res) => {
  const { id, amountPaid } = req.body;
  if (!id) {
    res.json({ success: false, status: "no id" });
  } else {
    try {
      const book = await GuestModel.findById(id);
      if (!book) {
        res.json({ success: false, status: "failed" });
      } else {
        for (let i = 0; i < book.ub_ids.length; i++) {
          await UpBookModel.findByIdAndDelete(book.ub_ids[i]);
        }
        book.ub_ids = [];
        book.status = 12;
        book.amountPaid = amountPaid;
        book.save();
      }
      res.json({ success: true, status: "success" });
    } catch (error) {
      res.json({ success: false, status: "failed" });
    }
  }
};

const resheduleBooking = async (req, res) => {
  const data = req.body;
  const bok = await GuestModel.findById(data.bid);

  if (bok.ub_ids.length > 0) {
    for (let i = 0; i < bok.ub_ids.length; i++) {
      await UpBookModel.findByIdAndDelete(bok.ub_ids[i]);
    }
  }
  bok.ub_ids = [];

  const chk = await UpBookModel.find({
    hotelId: req.user.sid,
    room: { $in: data.catrooms },
    fromDate: { $lte: data.toDate },
    toDate: { $gte: data.fromDate },
  });

  if (chk.length + data.nrooms > data.catrooms.length) {
    bok.status = 4;
    bok.save();
    res.json({
      success: false,
      status: "rooms not available, currently reschedule is on hold",
    });
  } else {
    if (bok) {
      const temp = [];
      const troom = [];
      for (let i = 0; data.nrooms > 0 && i < data.catrooms.length; i++) {
        if (!chk.some((e) => e.room === data.catrooms[i])) {
          const up = await UpBookModel.create({
            hotelId: req.user.sid,
            room: data.catrooms[i],
            booking_id: data.bid,
            fromDate: data.fromDate,
            toDate: data.toDate,
            confirmed: true,
          });
          temp.push(up._id);
          troom.push(data.catrooms[i]);
          data.nrooms -= 1;
        }
      }
      bok.ub_ids = temp;
      bok.fromDate = data.fromDate;
      bok.toDate = data.toDate;
      bok.rooms = troom;
      bok.status = 1;
      bok.save();

      res.json({ success: true, status: "reshedule successful" });
    } else {
      res.json({ success: false, status: "booking not found" });
    }
  }
};

module.exports = {
  getBookings,
  updateBooking,
  cancelBooking,
  resheduleBooking,
  checkoutBooking,
};
