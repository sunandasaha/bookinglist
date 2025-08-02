const fs = require("fs");
const Hotelmodel = require("../models/Hotel");
const PerPersonmodel = require("../models/PerPerson");
const path = require("path");

const createPerPersonCategory = async (req, res) => {
  const data = JSON.parse(req.body.details);
  try {
    const hot = await Hotelmodel.findById(req.user.sid).populate(
      "per_person_cat"
    );
    if (hot) {
      const pnr = hot.per_person_cat.reduce(
        (t, e) => t + e.roomNumbers.length,
        0
      );
      if (hot.rooms >= pnr + data.roomNumbers.length) {
        const roomcat = await PerPersonmodel.create({
          ...data,
          images: req.savedImages,
        });
        hot.per_person_cat = [...hot.per_person_cat, roomcat._id];
        await hot.save();
        res.json({ status: "success", hotel: hot, success: true });
      } else {
        res.json({
          status: "number of rooms exceding total no. of rooms",
          success: false,
        });
      }
    } else {
      res.json({ status: "cannot find the hotel" });
    }
  } catch (error) {
    console.log(error);
    if (req.savedImages && req.savedImages.length > 0) {
      req.savedImages.forEach((e) => {
        deleteFile(e);
      });
    }
    res.json({ status: "failed", error });
  }
};

const modifyPerPersonCategory = async (req, res) => {
  const data = req.body;
  const cat = await PerPersonmodel.findById(data._id);
  if (cat) {
    cat.name = data.name;
    cat.rate1 = data.rate1;
    cat.rate2 = data.rate2;
    cat.rate3 = data.rate3;
    cat.rate4 = data.rate4;
    cat.roomNumbers = [...data.roomNumbers];
    cat.advance = data.advance;
    cat.amenities = data.amenities;
    cat.agentCommission = data.agentCommission;
    cat.capacity = data.capacity;
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate(
      "per_person_cat"
    );
    res.json({ status: "success", hotel: hot, success: true });
  } else {
    res.json({ status: "failed" });
  }
};

const addImgPerPerson = async (req, res) => {
  const data = req.body;
  const cat = await PerPersonmodel.findById(data._id);
  if (cat) {
    cat.images = [...cat.images, ...req.savedImages];
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate(
      "per_person_cat"
    );
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

const deleteImgPerPerson = async (req, res) => {
  const data = req.body;
  const cat = await PerPersonmodel.findById(data._id);
  if (cat) {
    data.images.forEach((el) => {
      fs.unlink(path.join(__dirname, "..", "uploads", el), (err) => {
        if (err) console.log(err);
      });
      cat.images = cat.images.filter((e) => e !== el);
    });
    await cat.save();
    const hot = await Hotelmodel.findById(req.user.sid).populate(
      "per_person_cat"
    );
    res.json({ status: "success", hotel: hot, success: true });
  } else {
    res.json({ status: "failed" });
  }
};

const deletePerPersonCategory = async (req, res) => {
  try {
    const data = req.body;
    const hot = await Hotelmodel.updateOne(
      { _id: req.user.sid },
      { $pull: { per_person_cat: data._id } }
    );
    const cat = await PerPersonmodel.findById(data._id);
    cat.images.forEach((el) => {
      fs.unlink(path.join(__dirname, "..", "uploads", el), (err) => {
        if (err) console.log(err);
      });
    });
    await PerPersonmodel.findByIdAndDelete(data._id);
    const ho = await Hotelmodel.findById(req.user.sid).populate(
      "per_person_cat"
    );
    res.json({ status: "success", hotel: ho, success: true });
  } catch (err) {
    console.log(err);
    res.json({ status: "failed", err });
  }
};

module.exports = {
  createPerPersonCategory,
  modifyPerPersonCategory,
  addImgPerPerson,
  deleteImgPerPerson,
  deletePerPersonCategory,
};
