const UserModel = require("../models/Users");
const HotelModel = require("../models/Hotel");
const GuestModel = require("../models/GuestBooking");
const UpBookModel = require("../models/UpcomingBookings");
const { randomInt } = require("crypto");

const createBooking = async (req, res) => {
  try {
    const data = req.body;
    if (!data.hotelId) {
      return res
        .status(400)
        .json({ status: "failed", message: "Missing hotel ID" });
    }
    if (!data.rooms || data.rooms.length === 0) {
      res.json({ status: "failed", message: "Rooms error" });
    }

    const chk = await UpBookModel.findOne({
      hotelId: data.hotelId,
      room: { $in: data.rooms },
      fromDate: { $lte: data.toDate },
      toDate: { $gte: data.fromDate },
    });

    if (chk) {
      res.json({
        success: false,
        status: "Already booked",
        message: "Already booked",
      });
      console.log("working", chk);
    } else {
      const bookingid = "BK" + Date.now().toString() + randomInt(100, 999);
      const temp = [];
      for (let i = 0; i < data.rooms.length; i++) {
        const up = await UpBookModel.create({
          hotelId: data.hotelId,
          room: data.rooms[i],
          booking_id: bookingid,
          fromDate: data.fromDate,
          toDate: data.toDate,
        });
        temp.push(up._id);
      }
      console.log(temp);

      const newBooking = await GuestModel.create({
        ...data,
        _id: bookingid,
        ub_ids: temp,
        status: req.user ? 1 : 0,
      });

      const book = await UpBookModel.find({
        hotelId: data.hotelId,
        fromDate: { $lte: data.toDate },
        toDate: { $gte: data.fromDate },
      }).select(
        req.user ? "fromDate toDate room booking_id" : "fromDate toDate room"
      );

      res.json({ status: "success", booking: newBooking, bookings: book });
    }
  } catch (error) {
    console.error("Create Booking error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};
const getBookingDetails = async (req, res) => {
  try {
    const booking = await GuestModel.findOne({
      booking_id: req.params.bookingId,
      hotelId: req.headers.hotelid
    }).lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ 
      success: true,
      booking: {
        ...booking,
        from: booking.fromDate,
        to: booking.toDate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteBooking = async (req, res) => {
  try {
    const hotelId = req.user.sid;
    const bookingId = req.params.id;

    const booking = await GuestModel.findOneAndDelete({
      _id: bookingId,
      hotelId,
    });
    if (!booking) {
      return res.status(404).json({
        status: "failed",
        message: "Booking not found or unauthorized",
      });
    }

    res.json({ status: "success", message: "Booking deleted" });
  } catch (error) {
    console.error("Delete Booking error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};
module.exports = {
  createBooking,
  getBookingDetails,
  deleteBooking,
};
