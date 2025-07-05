const {
  pendingUser,
  allUsers,
  statusUpdate,
  deleteId,
} = require("../controler/superAdmincon");
const { authUser, chkSadmin } = require("../middleware/auth");

const sadminroute = require("express").Router();

sadminroute.get("/pending", authUser, chkSadmin, pendingUser);
sadminroute.get("/users", authUser, chkSadmin, allUsers);
sadminroute.put("/status", authUser, chkSadmin, statusUpdate);
sadminroute.delete("/user", authUser, chkSadmin, deleteId);

module.exports = sadminroute;
