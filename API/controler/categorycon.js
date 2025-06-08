const fs = require("fs");
const RoomCatmodel = require("../models/Rooms");
const Hotelmodel = require("../models/Hotel");

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
      res.json({ status: "success", hotel: hot });
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
  const cat = await RoomCatmodel.findById(data.id);
  if (cat) {
    cat.name = data.name;
    cat.price = data.price;
    cat.room_no = [...data.room_no];
    cat.advance = data.advance;
    cat.agent_com = data.agent_com;
    cat.capacity = data.capacity;
    cat.price_for_extra_person = data.price_for_extra_person;
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate("room_cat");
    res.code(200).json({ status: "success", hotel: hot });
  } else {
    res.code(400).json({ status: "failed" });
  }
};

const addImg = async (req, res) => {
  const data = req.body;
  const cat = await RoomCatmodel.findById(data.id);
  if (cat) {
    cat.images = [...cat.images, ...req.savedImages];
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate("room_cat");
    res.code(200).json({ status: "success", hotel: hot });
  } else {
    req.savedImages.forEach((el) => {
      fs.unlink(`../upload/${el}`, (err) => {
        console.log(err);
      });
    });
    res.code(400).json({ status: "failed" });
  }
};

const deleteImg = async (req, res) => {
  const data = req.body;
  const cat = await RoomCatmodel.findById(data.id);
  if (cat) {
    data.images.forEach((el) => {
      fs.unlink(`../upload/${el}`, (err) => {
        console.log(err);
      });
      cat.images = cat.images.filter((e) => e !== el);
    });
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate("room_cat");
    res.code(200).json({ status: "success", hotel: hot });
  } else {
    res.code(400).json({ status: "failed" });
  }
};

const deleteRoomCategory = async (req, res) => {
  try {
    const data = req.body;
    const hot = await Hotelmodel.findById(req.user.sid);
    hot.room_cat = hot.room_cat.filter((el) => el !== data.id);
    await hot.save();
    const cat = await RoomCatmodel.findById(data.id);
    cat.images.forEach((el) => {
      fs.unlink(`../upload/${el}`, (err) => {
        console.log(err);
      });
    });
    await RoomCatmodel.findByIdAndDelete(data.id);
    res.code(200).json({ status: "success", hotel: hot });
  } catch (err) {
    res.code(400).json({ status: "failed", err });
  }
};

module.exports = {
  createRoomCategory,
  addImg,
  deleteImg,
  modifyRoomCategory,
  deleteRoomCategory,
};
