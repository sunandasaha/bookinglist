const mongoose = require("mongoose");

const RoomCatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: Number,
  room_no: [String],
  amenities: [String],
  agent_com: { amount: Number, percent: Boolean },
  images: [String],
  capacity: Number,
  price_for_extra_person: Number,
  advance: { amount: Number, percent: Boolean },
});

const RoomCatmodel = mongoose.model("roomcats", RoomCatSchema);
module.exports = RoomCatmodel;
