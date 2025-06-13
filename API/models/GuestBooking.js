const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotels",
      required: true,
    },
    agent_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "agents",
    },
    ub_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "upcoming_booking",
      },
    ],
    status: { type: Number, required: true },
    _id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: String,
    phone: Number,
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
      default: 1,
    },
    children: {
      type: Number,
      default: 0,
    },
    age_0_5: {
      type: Number,
      default: 0,
    },
    age_6_10: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    advanceAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const GuestModel = mongoose.model("Bookings", GuestSchema);
module.exports = GuestModel;
