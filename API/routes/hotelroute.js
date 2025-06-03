const { createHotel, updateHotel } = require("../controler/hotelcon");
const { authUser, chkHost } = require("../middleware/auth");

const hotelroute = require("express").Router();

hotelroute.post("/", authUser, chkHost, createHotel);
hotelroute.put("/", authUser, chkHost, updateHotel);

module.exports = hotelroute;
