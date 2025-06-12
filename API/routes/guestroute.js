const express = require("express");
const { createBooking, getBookings, updateBooking, deleteBooking } = require("../controler/guestcon");

const { authUser, chkHost } = require("../middleware/auth");

const guestroute = express.Router();

guestroute.post("/", authUser, chkHost, createBooking);
guestroute.get("/", authUser, chkHost, getBookings);
guestroute.put("/:id", authUser, chkHost, updateBooking);
guestroute.delete("/:id", authUser, chkHost, deleteBooking);


module.exports = guestroute;
