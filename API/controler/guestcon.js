const GuestModel = require("../models/GuestBooking");
const UserModel = require("../models/Users");

// CREATE Guest Booking
const createBooking = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    const hotelId = user.sid;

    if (!hotelId) {
      return res.status(400).json({ status: "failed", message: "Host has no hotel assigned." });
    }

    const data = req.body;

    // Add hotelId and generate unique booking ID
    const bookingId = "BK" + Date.now().toString().slice(-6);

    const newBooking = await GuestModel.create({
      ...data,
      hotelId,
      b_ID: bookingId,
    });

    res.json({ status: "success", booking: newBooking });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

// GET all bookings for the logged-in host's hotel
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
    console.error("Get Bookings Error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

// UPDATE a guest booking
const updateBooking = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    const hotelId = user.sid;

    const bookingId = req.params.id;
    const updatedData = req.body;

    // Check if the booking belongs to this host's hotel
    const booking = await GuestModel.findOne({ _id: bookingId, hotelId });

    if (!booking) {
      return res.status(404).json({ status: "failed", message: "Booking not found or not authorized." });
    }

    Object.assign(booking, updatedData);
    await booking.save();

    res.json({ status: "success", booking });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBooking,
};
