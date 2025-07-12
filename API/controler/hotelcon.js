const Hotelmodel = require("../models/Hotel");
const { randomInt } = require("crypto");
const Usermodel = require("../models/Users");

const createHotel = async (req, res) => {
  const data = req.body;
  try {
    let url = data.name.toLowerCase().replaceAll(" ", "_");
    const chk = await Hotelmodel.findOne({ url: url });
    if (chk?._id) {
      url += randomInt(100).toString();
    }
    const hot = await Hotelmodel.create({
      ...data,
      url,
      room_cat: [],
      per_person_cat: [],
    });
    const usr = await Usermodel.findById(req.user._id);
    usr.sid = hot._id;
    await usr.save();
    res.json({ status: "success", hotel: hot });
  } catch (error) {
    res.json({ status: "failed" });
    console.log(error);
  }
};

const updateHotel = async (req, res) => {
  const data = req.body;
  const hot = await Hotelmodel.findById(data._id)
    .populate("room_cat")
    .populate("per_person_cat");
  if (hot) {
    try {
      hot.name = data.name;
      hot.location = data.location;
      hot.rooms = data.rooms;
      hot.accountName = data.accountName;
      hot.ph1 = data.ph1;
      hot.ph2 = data.ph2;
      hot.pay_per = data.pay_per;
      hot.upi_id = data.upi_id;
      await hot.save();
      res.json({ status: "success", hotel: hot });
    } catch (error) {
      res.json({ status: "failed" });
      console.log(error);
    }
  } else {
    res.json({ status: "No hotel found" });
  }
};

const getHotelViaUrl = async (req, res) => {
  const { hotelurl } = req.headers;
  const hotel = await Hotelmodel.findOne({ url: hotelurl })
    .populate("room_cat")
    .populate("per_person_cat");
  if (hotel) {
    res.json({ success: true, hotel });
  } else {
    res.json({ success: false });
  }
};

const getHotelList = async (req, res) => {
  const hots = await Hotelmodel.find({}).select("name location url");
  res.json({ success: true, hotels: hots });
};
module.exports = {
  createHotel,
  updateHotel,
  getHotelViaUrl,
  getHotelList,
};
