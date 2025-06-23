const UserModel = require("../models/Users");
const HotelModel = require("../models/Hotel");
const GuestModel = require("../models/GuestBooking");
const UpBookModel = require("../models/UpcomingBookings");
const { randomInt } = require("crypto");
const { sendNewBook } = require("../sockets/global");

const createBooking = async (req, res) => {
  try {
    const data = req.body;
    const fromDate = new Date(data.fromDate.substring(0, 10));
    const toDate = new Date(data.toDate.substring(0, 10));
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
      fromDate: { $lte: toDate },
      toDate: { $gte: fromDate },
    });

    if (chk) {
      res.json({
        success: false,
        status: "Already booked",
        message: "Already booked",
      });
    } else {
      const bookingid = "BK" + Date.now().toString() + randomInt(100, 999);
      const temp = [];
      for (let i = 0; i < data.rooms.length; i++) {
        const up = await UpBookModel.create({
          hotelId: data.hotelId,
          room: data.rooms[i],
          booking_id: bookingid,
          fromDate,
          toDate,
          confirmed: req.user?.role === "host" ? true : false,
        });
        temp.push(up._id);
      }

      const newBooking = await GuestModel.create({
        ...data,
        _id: bookingid,
        ub_ids: temp,
        fromDate,
        toDate,
        status: req.user?.role === "host" ? 1 : 0,
        agent_Id: req.user?.role === "agent" ? req.user.sid : null,
      });
      if (req.user?.role !== "host") {
        sendNewBook(data.hotelId, newBooking);
      }

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

const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      return res
        .status(400)
        .json({ status: "failed", message: "missing booking id in headers" });
    }
    const booking = await GuestModel.findById(bookingId).populate("agent_Id");
    if (!booking) {
      return res
        .status(404)
        .json({ status: "failed", message: "missing booking" });
    }
    res.json({ status: "success", booking });
  } catch (error) {
    console.error("Booking Error", error);
    res.status(500).json({ status: "failed", error: error.message });
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

const getAgentBookings = async (req, res) => {
  if (req.user?.role === "agent") {
    const bookings = await GuestModel.find({ agent_Id: req.user.sid })
      .populate("hotelId")
      .sort({
        createdAt: -1,
      })
      .limit(50);
    res.json({ success: true, bookings });
  }
};

const getHotelBookings = async (req, res) => {
  if (req.user?.role === "host") {
    const bookings = await GuestModel.find({ hotelId: req.user.sid })
      .sort({
        createdAt: -1,
      })
      .limit(50);
    res.json({ success: true, bookings });
  }
};

const getCheckedBookings = async (req, res) => {
  const det = req.params.det;
  const date = new Date(new Date().toISOString().substring(0, 10));
  if (det) {
    let bok;
    if (det === "tb") {
      bok = await GuestModel.find({
        hotelId: req.user.sid,
        fromDate: { $lte: date },
        toDate: { $gte: date },
      });
    } else {
      bok =
        det === "checkin"
          ? await GuestModel.find({ hotelId: req.user.sid, fromDate: date })
          : await GuestModel.find({ hotelId: req.user.sid, toDate: date });
    }
    res.json({ success: true, bookings: bok });
  } else {
    res.json({ success: false });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  deleteBooking,
  getAgentBookings,
  getHotelBookings,
  getCheckedBookings,
};
