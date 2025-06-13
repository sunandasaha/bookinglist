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
const getSingleBooking = async (req, res) => {
  try {
    const booking = await GuestModel.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ status: "failed", message: "Booking not found" });
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
  getSingleBooking,
  deleteBooking,
};

