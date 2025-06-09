const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userroute = require("./routes/userroute");
const hotelroute = require("./routes/hotelroute");
const guestRoute = require("./routes/guestroute");
const categoryroute = require("./routes/categoryroute");
mongoose.connect(process.env.API_URI);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("this runs");
});
app.use(cors({})); // cors allow origin
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/imgs", express.static("./uploads/"));

//routes
app.use("/user", userroute);
app.use("/hotel", hotelroute);
app.use("/guestbooking", guestRoute);
app.use("/category", categoryroute);

app.use((err, req, res, next) => {
  console.log(err);

  // global error handler
  res.status(err.statusCode || 500).json({
    status: err.status || "Server Error",
    message: err.message || "Server Error",
  });
});
