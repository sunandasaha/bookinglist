const express = require("express");
const { uploadImages, resizeAndSaveImages } = require("../middleware/multer");
const {
  createRoomCategory,
  modifyRoomCategory,
  deleteImg,
  addImg,
  deleteRoomCategory,
} = require("../controler/categorycon");
const {
  createPerPersonCategory,
  modifyPerPersonCategory,
  deleteImgPerPerson,
  addImgPerPerson,
  deletePerPersonCategory,
} = require("../controler/perpersoncon");
const { authUser, chkHost } = require("../middleware/auth");

const categoryroute = express.Router();

categoryroute.post(
  "/room",
  authUser,
  chkHost,
  uploadImages,
  resizeAndSaveImages,
  createRoomCategory
);
categoryroute.put("/room", authUser, chkHost, modifyRoomCategory);
categoryroute.delete("/room/img", authUser, chkHost, deleteImg);
categoryroute.delete("/room", authUser, chkHost, deleteRoomCategory);
categoryroute.post(
  "/room/img",
  authUser,
  chkHost,
  uploadImages,
  resizeAndSaveImages,
  addImg
);
categoryroute.post(
  "/perperson",
  authUser,
  chkHost,
  uploadImages,
  resizeAndSaveImages,
  createPerPersonCategory
);
categoryroute.put("/perperson", authUser, chkHost, modifyPerPersonCategory);
categoryroute.delete("/perperson/img", authUser, chkHost, deleteImgPerPerson);
categoryroute.delete("/perperson", authUser, chkHost, deletePerPersonCategory);
categoryroute.post(
  "/perperson/img",
  authUser,
  chkHost,
  uploadImages,
  resizeAndSaveImages,
  addImgPerPerson
);

module.exports = categoryroute;
