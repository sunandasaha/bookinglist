const jwt = require("jsonwebtoken");
const Usermodel = require("../models/Users");

const authUser = (req, res, next) => {
  // validating token
  if (!req.headers.authorization) {
    res.json({ status: "Unauthorised Access" });
  }
  jwt.verify(
    req.headers.authorization,
    process.env.ACCESS_TOKEN,
    async (err, pl) => {
      if (err) {
        res.json({ status: "Unauthorised Access" });
      } else {
        const chk = await Usermodel.findById(pl.id);
        if (chk.email) {
          req.user = chk;
          next();
        } else {
          res.json({ status: "Unauthorised Access" });
        }
      }
    }
  );
};

const chkHost = (req, res, next) => {
  // checking for Admin
  if (req.user.role === "host") {
    next();
  } else {
    res.json({ status: "Unauthorised Access" });
  }
};

module.exports = { authUser, chkHost };
