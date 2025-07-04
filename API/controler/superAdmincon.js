const Agentmodel = require("../models/Agent");
const Hotelmodel = require("../models/Hotel");
const Usermodel = require("../models/Users");

const pendingUser = async (req, res) => {
  const users = await Usermodel.find({ status: 0, role: { $ne: "sadmin" } });
  for (let i = 0; i < users.length; i++) {
    if (users[i].role === "host") {
      users[i].sid = await Hotelmodel.findById(users[i].sid);
    } else {
      users[i].sid = await Agentmodel.findById(users[i].sid);
    }
  }
  res.json({ success: true, users });
};

const allUsers = async (req, res) => {
  const users = await Usermodel.find({
    status: { $ne: 0 },
    role: { $ne: "sadmin" },
  });
  for (let i = 0; i < users.length; i++) {
    if (users[i].role === "host") {
      console.log(users[i]);
      users[i].sid = await Hotelmodel.findById(users[i].sid);
    } else {
      users[i].sid = await Agentmodel.findById(users[i].sid);
    }
  }
  res.json({ success: true, users });
};

const statusUpdate = async (req, res) => {
  const { uid, status } = req.body;
  const user = await Usermodel.findById(uid);
  if (user) {
    user.status = status;
    await user.save();
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};

module.exports = { pendingUser, allUsers, statusUpdate };
