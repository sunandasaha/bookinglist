const Agentmodel = require("../models/Agent");
const Usermodel = require("../models/Users");
const fs = require("fs");

const createAgent = async (req, res) => {
  const data = JSON.parse(req.body.details);
  try {
    const hot = await Agentmodel.create({
      ...data,
      email: req.user.email,
      visiting_card: req.savedImages.length > 0 ? req.savedImages[0] : "",
    });
    const usr = await Usermodel.findById(req.user._id);
    usr.sid = hot._id;
    await usr.save();
    res.json({ status: "success", agent: hot });
  } catch (error) {
    res.json({ status: "failed" });
    console.log(error);
  }
};

const updateAgent = async (req, res) => {
  const data = req.body;
  const agt = await Agentmodel.findById(data._id);
  if (agt) {
    try {
      agt.name = data.name;
      agt.location = data.location;
      agt.agency = data.agency;
      agt.ph1 = data.ph1;
      agt.ph2 = data.ph2;
      agt.upi_id = data.upi_id;
      await hot.save();
      res.json({ status: "success", agent: agt });
    } catch (error) {
      res.json({ status: "failed" });
      console.log(error);
    }
  } else {
    res.json({ status: "No hotel found" });
  }
};

const updateVisitingCard = async (req, res) => {
  const agt = await Agentmodel.findById(req.user.sid);
  if (agt) {
    if (agt.visiting_card) {
      fs.unlink(
        path.join(__dirname, "..", "uploads", agt.visiting_card),
        (err) => {
          if (err) console.log(err);
        }
      );
    }
    if (req.savedImages.length > 0) {
      agt.visiting_card = req.savedImages[0];
    }
    await agt.save();
    res.json({ success: true, status: "success", agent: agt });
  } else {
    res.json({ success: false, status: "Failed" });
  }
};

module.exports = {
  createAgent,
  updateAgent,
  updateVisitingCard,
};
