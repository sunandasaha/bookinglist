const mongoose = require("mongoose");

const RoomCatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  roomNumbers: [String],
  capacity: Number,
  rate1: Number,
  rate2: Number,
  rate3: Number,
  rate4: Number,
  agentCommission: { amount: Number, percent: Boolean },
  advance: Number,
  images: [String],
});

const RoomCatmodel = mongoose.model("perperson", RoomCatSchema);
module.exports = RoomCatmodel;
