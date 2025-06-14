const express = require("express");
const {
  createBooking,
  getBookingDetails,
  deleteBooking,
} = require("../controler/guestcon");

const { authUser, chkHost } = require("../middleware/auth");
const { getBookings } = require("../controler/upbookingcon");

const guestroute = express.Router();

guestroute.post("/", authUser, chkHost, createBooking);
guestroute.delete("/:id", authUser, chkHost, deleteBooking);
guestroute.get("/bookings", getBookings);
guestroute.get("/bookingshost", authUser, chkHost, getBookings);
guestroute.get('/bookings/:bookingId', getBookingDetails);
module.exports = guestroute;
