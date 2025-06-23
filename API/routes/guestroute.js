const express = require("express");
const {
  createBooking,
  getBookingById,
  deleteBooking,
  getAgentBookings,
  getHotelBookings,
  getCheckedBookings,
} = require("../controler/guestcon");

const { authUser, chkHost, chkAgent } = require("../middleware/auth");
const {
  getBookings,
  updateBooking,
  cancelBooking,
  resheduleBooking,
} = require("../controler/upbookingcon");

const guestroute = express.Router();

guestroute.post("/", authUser, chkHost, createBooking);
guestroute.post("/agent", authUser, chkAgent, createBooking);
guestroute.post("/guest", createBooking);
guestroute.delete("/:id", authUser, chkHost, deleteBooking);
guestroute.get("/bookings", getBookings);
guestroute.get("/bookingshost", authUser, chkHost, getBookings);
guestroute.get("/bookings/:id", getBookingById);
guestroute.post("/pending", authUser, chkHost, updateBooking);
guestroute.get("/agent", authUser, chkAgent, getAgentBookings);
guestroute.get("/host", authUser, chkHost, getHotelBookings);
guestroute.get("/chk/:det", authUser, chkHost, getCheckedBookings);
guestroute.put("/status", authUser, chkHost, cancelBooking);
guestroute.put("/reschedule", authUser, chkHost, resheduleBooking);

module.exports = guestroute;
