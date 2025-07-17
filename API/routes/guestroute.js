const express = require("express");
const {
  createBooking,
  getBookingById,
  deleteBooking,
  getAgentBookings,
  getHotelBookings,
  getCheckedBookings,
  changeStatus,
  uploadScreenShot,
} = require("../controler/guestcon");

const { authUser, chkHost, chkAgent } = require("../middleware/auth");
const {
  getBookings,
  updateBooking,
  cancelBooking,
  resheduleBooking,
  checkoutBooking,
} = require("../controler/upbookingcon");
const { bookingHold } = require("../middleware/bookingQue");
const { uploadImages, resizeAndSaveImages } = require("../middleware/multer");
const { s3upload } = require("../middleware/bucket");

const guestroute = express.Router();

guestroute.post("/", authUser, chkHost, bookingHold, createBooking);
guestroute.post("/agent", authUser, chkAgent, bookingHold, createBooking);
guestroute.post("/guest", bookingHold, createBooking);
guestroute.post(
  "/guest/ss",
  uploadImages,
  resizeAndSaveImages,
  s3upload,
  uploadScreenShot
);
guestroute.delete("/:id", authUser, chkHost, deleteBooking);
guestroute.get("/bookings", getBookings);
guestroute.get("/bookingshost", authUser, chkHost, getBookings);
guestroute.get("/bookings/:id", authUser, getBookingById);
guestroute.post("/pending", authUser, chkHost, updateBooking);
guestroute.get("/agent", authUser, chkAgent, getAgentBookings);
guestroute.get("/host", authUser, chkHost, getHotelBookings);
guestroute.get("/chk/:det", authUser, chkHost, getCheckedBookings);
guestroute.put("/status", authUser, chkHost, cancelBooking);
guestroute.put("/stat", authUser, chkHost, changeStatus);
guestroute.put("/checkout", authUser, chkHost, checkoutBooking);
guestroute.put("/reschedule", authUser, chkHost, resheduleBooking);

module.exports = guestroute;
