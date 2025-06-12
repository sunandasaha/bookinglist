const express = require("express");
const { createBooking, getSingleBooking, deleteBooking } = require("../controler/guestcon");

const { authUser, chkHost } = require("../middleware/auth");

const guestroute = express.Router();

guestroute.post("/", authUser, chkHost, createBooking);
guestroute.get("/booking/:id", getSingleBooking);
guestroute.delete("/:id", authUser, chkHost, deleteBooking);


module.exports = guestroute;
