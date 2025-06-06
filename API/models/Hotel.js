const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  upi_id: {
    type: String,
    required: true,
    unique: true,
  },
  ph1: String,
  ph2: String,
  rooms: Number,
  pay_per: {
    type: { person: Boolean, room: Boolean },
  },
});

const Hotelmodel = mongoose.model("hotels", HotelSchema);
module.exports = Hotelmodel;
