const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { Server } = require("socket.io");
const userroute = require("./routes/userroute");
const sadminroute = require("./routes/sadminroute");
const hotelroute = require("./routes/hotelroute");
const guestRoute = require("./routes/guestroute");
const categoryroute = require("./routes/categoryroute");
const agentroute = require("./routes/agentroute");
const socetHandler = require("./sockets");
const { setio } = require("./sockets/global");
mongoose.connect(process.env.API_URIS);

const hid = new Map();
const PORT = 8080;
const ser = app.listen(PORT, () => {
  console.log("this runs");
});
const io = new Server(ser, {
  cors: {
    origin: "*",
  },
});
app.use(cors({})); // cors allow origin
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/imgs", express.static("./uploads/"));

//routes
app.use("/user", userroute);
app.use("/sadmin", sadminroute);
app.use("/hotel", hotelroute);
app.use("/agent", agentroute);
app.use("/guestbooking", guestRoute);
app.use("/category", categoryroute);

//socket
socetHandler(io, hid);
setio(io, hid);

// global error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json({
    status: err.status || "Server Error",
    message: err.message || "Server Error",
  });
});
