const Agentmodel = require("../models/Agent");
const Hotelmodel = require("../models/Hotel");
const PerPersonmodel = require("../models/PerPerson");
const RoomCatmodel = require("../models/Rooms");
const Usermodel = require("../models/Users");
const { deleteFile } = require("../utils/upload");

const pendingUser = async (req, res) => {
  const users = await Usermodel.find({
    status: 0,
    role: { $ne: "sadmin" },
    sid: { $exists: true },
  });
  for (let i = 0; i < users.length; i++) {
    let dat;
    if (users[i].role === "host") {
      dat = await Hotelmodel.findById(users[i].sid);
    } else {
      dat = await Agentmodel.findById(users[i].sid);
    }
    users[i].sid = JSON.stringify(dat);
  }
  res.json({ success: true, users });
};

const allUsers = async (req, res) => {
  const users = await Usermodel.find({
    status: { $ne: 0 },
    role: { $ne: "sadmin" },
  });
  for (let i = 0; i < users.length; i++) {
    let dat;
    if (users[i].role === "host") {
      dat = await Hotelmodel.findById(users[i].sid);
    } else {
      dat = await Agentmodel.findById(users[i].sid);
    }
    users[i].sid = JSON.stringify(dat);
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
  if (usr) {
    if (usr.role === "host") {
      if (usr.sid) {
        const hot = await Hotelmodel.findByIdAndDelete(usr.sid);
        if (hot?.room_cat && hot.room_cat.length > 0) {
          for (let i = 0; i < hot.room_cat.length; i++) {
            const cat = await RoomCatmodel.findByIdAndDelete(
              hot.room_cat[i].toString()
            );
            if (cat?.images && cat.images.length > 0) {
              for (let j = 0; j < cat.images.length; j++) {
                await deleteFile(cat.images[j]);
              }
            }
          }
        }
        if (hot?.per_person_cat && hot.per_person_cat.length > 0) {
          for (let i = 0; i < hot.room_cat.length; i++) {
            const cat = await PerPersonmodel.findByIdAndDelete(
              hot.room_cat[i].toString()
            );
            if (cat?.images && cat.images.length > 0) {
              for (let j = 0; j < cat.images.length; j++) {
                await deleteFile(cat.images[j]);
              }
            }
          }
        }
      }
    } else {
      if (usr.sid) {
        const agt = await Agentmodel.findByIdAndDelete(usr.sid);
        if (agt && agt.visiting_card) deleteFile(agt.visiting_card);
      }
    }
    await Usermodel.findByIdAndDelete(usr._id);
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};

module.exports = { pendingUser, allUsers, statusUpdate, deleteId };
