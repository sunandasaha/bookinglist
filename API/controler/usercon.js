const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { createHmac } = require("crypto");
const Usermodel = require("../models/Users");
const Hotelmodel = require("../models/Hotel");
const Agentmodel = require("../models/Agent");
const GuestModel = require("../models/GuestBooking");

const retry = new Map();

const getCred = async (code) => {
  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "postmessage"
    );
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    const res = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const userCred = await res.json();
    return userCred;
  } catch (error) {
    console.log(error);
    return {};
  }
};

const getDet = async (role, id) => {
  let cred = undefined;
  if (id) {
    if (role === "host") {
      cred = await Hotelmodel.findById(id)
        .populate("room_cat")
        .populate("per_person_cat");
    } else if (role === "agent") {
      cred = await Agentmodel.findById(id);
    }
  }
  return cred;
};

const getPending = async (role, id) => {
  if (role === "host" && id) {
    const pen = await GuestModel.find({ status: 0, hotelId: id });
    return pen;
  }
  return null;
};

const glogin = async (req, res) => {
  const gres = await getCred(req.body.code);
  let user = await Usermodel.findOne({ email: gres.email });
  if (!user?._id) {
    // Creating new user with gmail
    user = await Usermodel.create({
      email: gres.email,
      password: "google",
      role: "",
      status: 0,
    });
  }
  if (user._id) {
    const tok = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN
    );
    const cred = await getDet(user?.role, user?.sid);
    const pending = await getPending(user?.role, user?.sid);
    res.json({
      status: "success",
      user: { role: user.role, token: tok, cred, pending, status: user.status },
    });
  } else {
    res.json({ status: "failed" });
  }
};

const setRole = async (req, res) => {
  const { role } = req.body;
  const user = await Usermodel.findById(req.user._id);
  if (user._id) {
    user.role = role;
    await user.save();
    const tok = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN
    );
    res.json({
      status: "success",
      user: { role: user.role, token: tok },
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const ret = retry.get(email);
  // Anti brute force
  if (ret && ret.time + ret.cd > Date.now()) {
    const rt = Math.floor((ret.time + ret.cd - Date.now()) / 1000);
    res.json({ status: `Try again after ${rt}sec` });
  } else {
    const chk = await Usermodel.findOne({ email: email });
    if (chk) {
      const hpass = createHmac("sha256", process.env.SECRET) // password hashig
        .update(password)
        .digest("base64");
      if (hpass === chk.password) {
        const tok = jwt.sign(
          { id: chk._id, role: chk.role },
          process.env.ACCESS_TOKEN
        );
        const cred = await getDet(chk.role, chk.sid);
        const pending = await getPending(chk?.role, chk?.sid);
        res.json({
          status: "success",
          user: {
            role: chk.role,
            token: tok,
            cred,
            pending,
            status: chk.status,
          },
        });
      } else if (chk.password === "google") {
        res.json({ status: "Login with Google" });
      } else {
        res.json({ status: "Wrong Password" });
        retry.set(email, {
          time: Date.now(),
          cd: ret?.cd ? ret.cd + 30000 : -30000,
        });
      }
    } else {
      res.json({ status: "No User Found" });
    }
  }
};

const signup = async (req, res) => {
  const { email, password } = req.body;
  const chk = await Usermodel.findOne({ email: email });
  if (chk) {
    res.json({ status: "Email already Registered" });
  } else {
    const hpass = createHmac("sha256", process.env.SECRET) // Password hashing
      .update(password)
      .digest("base64");
    const user = await Usermodel.create({
      email,
      password: hpass,
      role: "",
      status: 0,
    });
    const tok = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN
    );
    res.json({
      status: "success",
      user: { role: user.role, token: tok },
    });
  }
};

const logTok = async (req, res) => {
  const { tok } = req.body;
  jwt.verify(tok, process.env.ACCESS_TOKEN, async (err, pl) => {
    if (err) {
      res.json({ status: "failed" });
    } else {
      const user = await Usermodel.findById(pl.id);
      if (user.email) {
        const tok = jwt.sign(
          { id: user._id, role: user.role },
          process.env.ACCESS_TOKEN
        );
        const cred = await getDet(user.role, user.sid);
        const pending = await getPending(user?.role, user?.sid);
        res.json({
          status: "success",
          user: {
            role: user.role,
            token: tok,
            cred,
            pending,
            status: user.status,
          },
        });
      }
    }
  });
};
module.exports = {
  login,
  signup,
  glogin,
  logTok,
  setRole,
};
