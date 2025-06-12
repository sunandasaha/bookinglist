const GuestModel = require("../models/GuestBooking");
const UserModel = require("../models/Users");
const HotelModel = require("../models/Hotel"); 

const createBooking = async (req, res) => {
  try {
    const hotelId = req.body;
    if (!hotelId) {
      return res
        .status(400)
        .json({ status: "failed", message: "Host has no hotel assigned." });
    }

    const data = req.body;
    const bookingid = "BK" + Date.now().toString().slice(-6);

    const hotel = await HotelModel.findById(hotelId);
    if (!hotel) {
      return res
        .status(404)
        .json({ status: "failed", message: "Hotel not found" });
    }

    const start = new Date(data.fromDate);
    const end = new Date(data.toDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

    let total = 0;
    let advance = 0;

    if (hotel.pay_per.room) {
      // ROOM-BASED PRICING
      const roomData = hotel.per_room_cat.flatMap(cat =>
        cat.roomNumbers.map(room => ({
          name: room,
          price: cat.rate,
          advancePercent: cat.advance || 0,
        }))
      );

      data.rooms.forEach((room) => {
        const match = roomData.find(r => r.name === room);
        if (match) {
          total += match.price * nights;
          advance += (match.price * nights * match.advancePercent) / 100;
        }
      });

    } else if (hotel.pay_per.person) {
      // PERSON-BASED PRICING
      const roomData = hotel.per_person_cat.flatMap(cat =>
        cat.roomNumbers.map(room => ({
          name: room,
          rate1: cat.rate1,
          rate2: cat.rate2,
          rate3: cat.rate3,
          rate4: cat.rate4,
          advancePercent: cat.advance || 0,
        }))
      );

      data.rooms.forEach((room) => {
        const match = roomData.find(r => r.name === room);
        if (match) {
          const persons = Number(data.adults) + Number(data.children);
          let rate = match.rate1;
          if (persons === 2) rate = match.rate2;
          else if (persons === 3) rate = match.rate3;
          else if (persons >= 4) rate = match.rate4;

          total += rate * nights;
          advance += (rate * nights * match.advancePercent) / 100;
        }
      });
    }

    const newBooking = await GuestModel.create({
      ...data,
      hotelId,
      b_ID: bookingid,
      totalPrice: Math.round(total),
      advanceAmount: Math.round(advance),
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

