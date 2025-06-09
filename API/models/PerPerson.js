const mongoose = require("mongoose");

const PerPersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  roomNumbers: [String],
  amenities: [String],
  capacity: Number,
  rate1: Number,
  rate2: Number,
  rate3: Number,
  rate4: Number,
  agentCommission: { amount: Number, percent: Boolean },
  advance: { amount: Number, percent: Boolean },
  images: [String],
});

const PerPersonmodel = mongoose.model("perperson", PerPersonSchema);
module.exports = PerPersonmodel;
