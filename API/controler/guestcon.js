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
        ub_id: temp,
        status: 0,
      });

      res.json({ status: "success", booking: newBooking });
    }
  } catch (error) {
    console.error("Create Booking error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

const getSingleBooking = async (req, res) => {
  try {
    const booking = await GuestModel.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ status: "failed", message: "Booking not found" });
    }

    res.json({ status: "success", booking });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
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
  getSingleBooking,
  deleteBooking,
};
