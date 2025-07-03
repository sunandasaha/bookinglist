const { pendingUser, allUsers } = require("../controler/superAdmincon");
const { authUser, chkSadmin } = require("../middleware/auth");

const sadminroute = require("express").Router();

sadminroute.get("/pending", authUser, chkSadmin, pendingUser);
sadminroute.get("/users", authUser, chkSadmin, allUsers);

module.exports = sadminroute;
