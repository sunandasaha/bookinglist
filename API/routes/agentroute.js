const {
  createAgent,
  updateAgent,
  updateVisitingCard,
} = require("../controler/agentcon");
const { authUser, chkAgent } = require("../middleware/auth");
const { uploadImages, resizeAndSaveImages } = require("../middleware/multer");

const agentroute = require("express").Router();

agentroute.post(
  "/",
  authUser,
  chkAgent,
  uploadImages,
  resizeAndSaveImages,
  createAgent
);
agentroute.put("/", authUser, chkAgent, updateAgent);
agentroute.put(
  "/viscard",
  authUser,
  chkAgent,
  uploadImages,
  resizeAndSaveImages,
  updateVisitingCard
);

module.exports = agentroute;
