const express = require("express");
const {
  createBooking,
  getBookingById,
  deleteBooking,
} = require("../controler/guestcon");

const { authUser, chkHost, chkAgent } = require("../middleware/auth");
const { getBookings } = require("../controler/upbookingcon");

const guestroute = express.Router();

guestroute.post("/", authUser, chkHost, createBooking);
guestroute.post("/agent", authUser, chkAgent, createBooking);
guestroute.post("/guest", createBooking);
guestroute.delete("/:id", authUser, chkHost, deleteBooking);
guestroute.get("/bookings", getBookings);
guestroute.get("/bookingshost", authUser, chkHost, getBookings);
guestroute.get("/bookings/:id", getBookingById);

module.exports = guestroute;
