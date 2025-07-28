const Agentmodel = require("../models/Agent");
const Hotelmodel = require("../models/Hotel");
const Usermodel = require("../models/Users");

const pendingUser = async (req, res) => {
  const users = await Usermodel.find({
    status: 0,
    role: { $ne: "sadmin" },
    sid: { $exists: true },
  });
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

const deleteId = async (req, res) => {
  const id = req.body?.id || req.params?.id;
  const usr = await Usermodel.findById(id);
  console.log("yolo", id, usr);

  if (usr) {
    if (usr.role === "host") {
      if (usr.sid) await Hotelmodel.findByIdAndDelete(usr.sid);
    } else {
      if (usr.sid) await Agentmodel.findByIdAndDelete(usr.sid);
    }
    await Usermodel.findByIdAndDelete(usr._id);
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};

module.exports = { pendingUser, allUsers, statusUpdate, deleteId };
