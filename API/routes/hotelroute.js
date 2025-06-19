const {
  createHotel,
  updateHotel,
  getHotelViaUrl,
  getHotelList,
} = require("../controler/hotelcon");
const { authUser, chkHost, chkAgent } = require("../middleware/auth");

const hotelroute = require("express").Router();

hotelroute.post("/", authUser, chkHost, createHotel);
hotelroute.put("/", authUser, chkHost, updateHotel);
hotelroute.get("/", getHotelViaUrl);
hotelroute.get("/hotels", authUser, chkAgent, getHotelList);
module.exports = hotelroute;
