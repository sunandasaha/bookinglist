const GuestModel = require("../models/GuestBooking");
const UserModel = require("../models/Users");
const HotelModel = require("../models/Hotel"); 

const createBooking = async (req, res) => {
  try {
    const data = req.body;
    if (!data.hotelId) {
      return res.status(400).json({ status: "failed", message: "Missing hotel ID" });
    }

    const bookingid = "BK" + Date.now().toString().slice(-6);

    const newBooking = await GuestModel.create({
      ...data,
      b_ID: bookingid,
    });

    res.json({ status: "success", booking: newBooking });
  } catch (error) {
    console.error("Create Booking error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    const hotelId = user.sid;

    if (!hotelId) {
      return res.status(400).json({
        status: "failed",
        message: "Host has no hotel assigned.",
      });
    }

    const bookingId = req.params.id;
    const updatedData = req.body;
    const booking = await GuestModel.findOne({ _id: bookingId, hotelId });
    if (!booking) {
      return res.status(404).json({
        status: "failed",
        message: "Booking not found or not authorized.",
      });
    }
    const allowedFields = [
      "name", "email", "phone", "whatsapp", "address",
      "adults", "children", "age_0_5", "age_6_10"
    ];

    allowedFields.forEach((field) => {
      if (updatedData[field] !== undefined) {
        booking[field] = updatedData[field];
      }
    });

    await booking.save();

    res.json({ status: "success", booking });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    const hotelId = user.sid;

    if (!hotelId) {
      return res.status(400).json({ status: "failed", message: "Host has no hotel assigned." });
    }

    const bookings = await GuestModel.find({ hotelId }).sort({ createdAt: -1 });

    res.json({ status: "success", bookings });
  } catch (error) {
    console.error("Get Booking error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};
const deleteBooking = async (req, res) => {
  try {
    const hotelId = req.user.sid;
    const bookingId = req.params.id;

    const booking = await GuestModel.findOneAndDelete({ _id: bookingId, hotelId });
    if (!booking) {
      return res.status(404).json({ status: "failed", message: "Booking not found or unauthorized" });
    }

    res.json({ status: "success", message: "Booking deleted" });
  } catch (error) {
    console.error("Delete Booking error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};
module.exports = {
  createBooking,
  updateBooking,
  getBookings,
  deleteBooking,
};

