const fs = require("fs");
const RoomCatmodel = require("../models/Rooms");
const Hotelmodel = require("../models/Hotel");
const path = require("path");

const createRoomCategory = async (req, res) => {
  const data = JSON.parse(req.body.details);
  try {
    const hot = await Hotelmodel.findById(req.user.sid);
    if (hot) {
      const roomcat = await RoomCatmodel.create({
        ...data,
        images: req.savedImages,
      });
      hot.room_cat = [...hot.room_cat, roomcat._id];
      await hot.save();
      const ho = await Hotelmodel.findById(req.user.sid).populate("room_cat");
      res.json({ status: "success", hotel: ho });
    } else {
      res.json({ status: "cannot find the hotel" });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: "failed", error });
  }
};

const modifyRoomCategory = async (req, res) => {
  const data = req.body;
  const cat = await RoomCatmodel.findById(data._id);
  if (cat) {
    cat.name = data.name;
    cat.price = data.price;
    cat.room_no = [...data.room_no];
    cat.advance = data.advance;
    cat.amenities = data.amenities;
    cat.agent_com = data.agent_com;
    cat.capacity = data.capacity;
    cat.price_for_extra_person = data.price_for_extra_person;
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate("room_cat");
    res.json({ status: "success", hotel: hot });
  } else {
    res.json({ status: "failed" });
  }
};

const addImg = async (req, res) => {
  const data = req.body;
  const cat = await RoomCatmodel.findById(data._id);
  if (cat) {
    cat.images = [...cat.images, ...req.savedImages];
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate("room_cat");
    res.json({ status: "success", hotel: hot });
  } else {
    req.savedImages.forEach((el) => {
      fs.unlink(`../upload/${el}`, (err) => {
        console.log(err);
      });
    });
    res.json({ status: "failed" });
  }
};

const deleteImg = async (req, res) => {
  const data = req.body;
  const cat = await RoomCatmodel.findById(data._id);
  if (cat) {
    data.images.forEach((el) => {
      fs.unlink(path.join(__dirname, "..", "uploads", el), (err) => {
        if (err) console.log(err);
      });
      cat.images = cat.images.filter((e) => e !== el);
    });
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate("room_cat");
    res.json({ status: "success", hotel: hot });
  } else {
    res.json({ status: "failed" });
  }
};

const deleteRoomCategory = async (req, res) => {
  try {
    const data = req.body;
    const hot = await Hotelmodel.updateOne(
      { _id: req.user.sid },
      { $pull: { room_cat: data._id } }
    );
    const cat = await RoomCatmodel.findById(data._id);
    cat.images.forEach((el) => {
      fs.unlink(path.join(__dirname, "..", "uploads", el), (err) => {
        if (err) console.log(err);
      });
    });
    await RoomCatmodel.findByIdAndDelete(data._id);
    const ho = await Hotelmodel.findById(req.user.sid).populate("room_cat");
    res.json({ status: "success", hotel: ho });
  } catch (err) {
    console.log(err);

    res.json({ status: "failed", err });
  }
};

module.exports = {
  createRoomCategory,
  addImg,
  deleteImg,
  modifyRoomCategory,
  deleteRoomCategory,
};
