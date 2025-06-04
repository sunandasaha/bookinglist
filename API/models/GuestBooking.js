const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema({
  hotelId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "hotels",
  required: true,
},

  b_ID: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  whatsapp: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  rooms: {
    type: [String],
    required: true,
  },
  adults: {
    type: Number,
    default: 0,
  },
  children: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("GuestBooking", GuestSchema);
