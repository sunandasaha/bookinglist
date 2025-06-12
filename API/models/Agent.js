const mongoose = require("mongoose");

const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  agency: {
    type: String,
    required: true,
    unique: true,
  },
  ph1: {
    type: String,
    required: true,
    unique: true,
  },
  upi_id: String,
  ph2: String,
  visiting_card: String,
});

const Agentmodel = mongoose.model("agents", AgentSchema);
module.exports = Agentmodel;
