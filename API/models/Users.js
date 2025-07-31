const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
    sid: String,
    status: {
      required: true,
      type: Number,
    },
    validUpto: Date,
  },
  { timestamps: true }
);

const Usermodel = mongoose.model("users", UserSchema);
module.exports = Usermodel;
