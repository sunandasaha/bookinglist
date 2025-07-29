const GuestModel = require("../models/GuestBooking");
const UpBookModel = require("../models/UpcomingBookings");
const { randomInt } = require("crypto");
const { sendNewBook, sendSsBook } = require("../sockets/global");
const { setFalse } = require("../middleware/bookingQue");
const { deleteTimeout, addTimeOut } = require("./timercon");
const { decrypt, encrypt } = require("../utils/encription");
const Agentmodel = require("../models/Agent");

const createBooking = async (req, res) => {
  const data = req.body;
  try {
    const today = new Date(new Date().toISOString().substring(0, 10));
    const fromDate = new Date(data.fromDate.substring(0, 10));
    const toDate = new Date(data.toDate.substring(0, 10));

    if (today > fromDate || fromDate > toDate) {
      setFalse(data.hotelId);
      res.json({ status: "failed", message: "Invalid date", success: false });
    } else {
      if (!data.hotelId) {
        setFalse(data.hotelId);
        return res
          .status(400)
          .json({ status: "failed", message: "Missing hotel ID" });
      }
      if (!data.rooms || data.rooms.length === 0) {
        setFalse(data.hotelId);
        res.json({ status: "failed", message: "Rooms error" });
      }

      const chk = await UpBookModel.findOne({
        hotelId: data.hotelId,
        room: { $in: data.rooms },
        fromDate: { $lte: toDate },
        toDate: { $gte: fromDate },
      });

      if (chk) {
        setFalse(data.hotelId);
        res.json({
          success: false,
          status: "Already booked",
          message: "Already booked",
        });
      } else {
        const bookingid =
          "BK" + Date.now().toString().substring(3) + randomInt(100, 999);
        const temp = [];
        for (let i = 0; i < data.rooms.length; i++) {
          const up = await UpBookModel.create({
            hotelId: data.hotelId,
            room: data.rooms[i],
            booking_id: bookingid,
            fromDate,
            toDate,
            confirmed: req.user?.role === "host" ? true : false,
          });
          temp.push(up._id);
        }

        data.name = encrypt(bookingid, data.name);
        data.address = encrypt(bookingid, data.address);
        data.email = encrypt(bookingid, data.email);
        data.phone = encrypt(bookingid, data.phone);
        data.whatsapp = encrypt(bookingid, data.whatsapp);

        const newBooking = await GuestModel.create({
          ...data,
          _id: bookingid,
          ub_ids: temp,
          fromDate,
          toDate,
          status: req.user?.role === "host" ? 1 : 0,
          agent_Id: req.user?.role === "agent" ? req.user.sid : null,
        });

        const dnbook = decryptData(newBooking);
        if (dnbook.agent_Id)
          dnbook.agent_Id = await Agentmodel.findById(dnbook.agent_Id);
        if (req.user?.role !== "host") {
          sendNewBook(data.hotelId, dnbook);
          addTimeOut(newBooking._id);
        }

        const book = await UpBookModel.find({
          hotelId: data.hotelId,
          fromDate: { $lte: data.toDate },
          toDate: { $gte: data.fromDate },
        }).select(
          req.user ? "fromDate toDate room booking_id" : "fromDate toDate room"
        );

        setFalse(data.hotelId);

        res.json({ status: "success", booking: dnbook, bookings: book });
      }
    }
  } catch (error) {
    setFalse(data.hotelId);
    console.error("Create Booking error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

const decryptData = (data) => {
  data.name = decrypt(data._id, data.name);
  data.address = decrypt(data._id, data.address);
  data.email = decrypt(data._id, data.email);
  data.phone = decrypt(data._id, data.phone);
  data.whatsapp = decrypt(data._id, data.whatsapp);
  return data;
};

const uploadScreenShot = async (req, res) => {
  const bid = req.body.bid;
  deleteTimeout(bid);
  const booking = await GuestModel.findById(bid).populate("agent_Id");
  if (booking) {
    booking.advance_ss = req.savedImages[0];
    await booking.save();
    const dnbook = decryptData(booking);
    sendSsBook(booking.hotelId, dnbook);
    res.json({ success: true, booking });
  } else {
    res.json({ succuss: false });
  }
};

const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      return res
        .status(400)
        .json({ status: "failed", message: "missing booking id in headers" });
    }
    const booking = await GuestModel.findById(bookingId).populate("agent_Id");
    if (
      !booking ||
      (booking.hotelId?.toString() !== req.user?.sid &&
        booking.agent_Id?.toString() !== req.user?.sid)
    ) {
      return res
        .status(404)
        .json({ status: "failed", message: "missing booking" });
    } else {
      const dnbook = decryptData(booking);
      res.json({ status: "success", booking: dnbook });
    }
  } catch (error) {
    console.error("Booking Error", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const hotelId = req.user.sid;
    const bookingId = req.params.id;

    const booking = await GuestModel.findOneAndDelete({
      _id: bookingId,
      hotelId,
    });
    if (!booking) {
      return res.status(404).json({
        status: "failed",
        message: "Booking not found or unauthorized",
      });
    }

    res.json({ status: "success", message: "Booking deleted" });
  } catch (error) {
    console.error("Delete Booking error:", error);
    res.status(500).json({ status: "failed", error: error.message });
  }
};

const getAgentBookings = async (req, res) => {
  if (req.user?.role === "agent") {
    const bookings = await GuestModel.find({ agent_Id: req.user.sid })
      .populate("hotelId")
      .sort({
        createdAt: -1,
      })
      .limit(50);
    const dbooks = bookings.map((e) => decryptData(e));
    res.json({ success: true, dbooks });
  }
};

const getHotelBookings = async (req, res) => {
  if (req.user?.role === "host") {
    const bookings = await GuestModel.find({ hotelId: req.user.sid })
      .sort({
        createdAt: -1,
      })
      .limit(50);
    const dbooks = bookings.map((e) => decryptData(e));
    res.json({ success: true, dbooks });
  }
};

const changeStatus = async (req, res) => {
  const { id, status } = req.body;
  const booking = await GuestModel.findById(id);
  if (booking) {
    booking.status = status;
    booking.save();
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};

const getCheckedBookings = async (req, res) => {
  const det = req.params.det;
  const date = new Date(new Date().toISOString().substring(0, 10));
  if (det) {
    let bok;
    if (det === "tb") {
      bok = await GuestModel.find({
        hotelId: req.user.sid,
        status: { $in: [1, 11] },
        fromDate: { $lte: date },
        toDate: { $gte: date },
      });
    } else {
      bok =
        det === "checkin"
          ? await GuestModel.find({
              hotelId: req.user.sid,
              fromDate: date,
              status: 1,
            })
          : await GuestModel.find({
              hotelId: req.user.sid,
              status: 11,
              toDate: new Date(
                new Date(new Date().setDate(date.getDate() - 1))
                  .toISOString()
                  .substring(0, 10)
              ),
            });
    }
    const dbooks = bok.map((e) => decryptData(e));
    res.json({ success: true, bookings: dbooks });
  } else {
    res.json({ success: false });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  deleteBooking,
  getAgentBookings,
  getHotelBookings,
  getCheckedBookings,
  changeStatus,
  uploadScreenShot,
  decryptData,
};
