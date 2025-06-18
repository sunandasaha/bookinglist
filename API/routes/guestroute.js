const express = require("express");
const {
  createBooking,
  getBookingById,
  deleteBooking,
} = require("../controler/guestcon");

const { authUser, chkHost, chkAgent } = require("../middleware/auth");
const { getBookings, updateBooking } = require("../controler/upbookingcon");

const guestroute = express.Router();

guestroute.post("/", authUser, chkHost, createBooking);
guestroute.post("/agent", authUser, chkAgent, createBooking);
guestroute.post("/guest", createBooking);
guestroute.delete("/:id", authUser, chkHost, deleteBooking);
guestroute.get("/bookings", getBookings);
guestroute.get("/bookingshost", authUser, chkHost, getBookings);
guestroute.get("/bookings/:id", getBookingById);
guestroute.post("/pending", authUser, chkHost, updateBooking);

module.exports = guestroute;
