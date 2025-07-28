const {
  createAgent,
  updateAgent,
  updateVisitingCard,
} = require("../controler/agentcon");
const { authUser, chkAgent } = require("../middleware/auth");
const { s3upload } = require("../middleware/bucket");
const { uploadImages, resizeAndSaveImages } = require("../middleware/multer");

const agentroute = require("express").Router();

agentroute.post(
  "/",
  authUser,
  chkAgent,
  uploadImages,
  resizeAndSaveImages,
  s3upload,
  createAgent
);
agentroute.put("/", authUser, chkAgent, updateAgent);
agentroute.put(
  "/viscard",
  authUser,
  chkAgent,
  uploadImages,
  resizeAndSaveImages,
  s3upload,
  updateVisitingCard
);

module.exports = agentroute;
