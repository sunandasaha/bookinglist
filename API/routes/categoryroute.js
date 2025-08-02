const express = require("express");
const { uploadImages, resizeAndSaveImages } = require("../middleware/multer");
const {
  modifyRoomCategory,
  deleteImg,
  addImg,
  deleteRoomCategory,
  createPerRoom,
} = require("../controler/categorycon");
const {
  modifyPerPersonCategory,
  deleteImgPerPerson,
  addImgPerPerson,
  deletePerPersonCategory,
  createPerPersonCategory,
} = require("../controler/perpersoncon");
const { authUser, chkHost } = require("../middleware/auth");
const { s3upload } = require("../middleware/bucket");

const categoryroute = express.Router();

//yolo

categoryroute.post(
  "/room",
  authUser,
  chkHost,
  uploadImages,
  resizeAndSaveImages,
  s3upload,
  createPerRoom
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
  s3upload,
  addImg
);
categoryroute.post(
  "/perperson",
  authUser,
  chkHost,
  uploadImages,
  resizeAndSaveImages,
  s3upload,
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
  s3upload,
  addImgPerPerson
);

module.exports = categoryroute;
