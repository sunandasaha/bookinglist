const express = require("express");
const { createBooking, getBookings, updateBooking } = require("../controler/guestcon");
const { authUser, chkHost } = require("../middleware/auth");

const router = express.Router();

router.post("/", authUser, chkHost, createBooking);
router.get("/", authUser, chkHost, getBookings);
router.put("/:id", authUser, chkHost, updateBooking);

module.exports = router;
