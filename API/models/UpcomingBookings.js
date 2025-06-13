const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotels",
      required: true,
    },
    booking_id: {
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
    room: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const UpBookModel = mongoose.model("upcoming_booking", GuestSchema);
module.exports = UpBookModel;
