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
  accountName: {
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
  description: String,
  imgs: [String],
  agentClicks: Number,
  guestClicks: Number,
  chkin: String,
  chkout: String,
  rooms: Number,
  room_cat: [{ type: mongoose.Schema.Types.ObjectId, ref: "roomcats" }],
  per_person_cat: [{ type: mongoose.Schema.Types.ObjectId, ref: "perperson" }],
  pay_per: {
    type: { person: Boolean, room: Boolean },
  },
});

const Hotelmodel = mongoose.model("hotels", HotelSchema);
module.exports = Hotelmodel;
