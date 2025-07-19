const { decryptData } = require("../controler/guestcon");
const GuestModel = require("../models/GuestBooking");
const UpBookModel = require("../models/UpcomingBookings");
const { sendEmail } = require("../utils/emailService");

const sid = new Map();

module.exports = (io, hid) => {
  io.on("connection", (soc) => {
    soc.on("disconnect", () => {});

    soc.on("host-con", ({ hotelid }) => {
      hid.set(hotelid, soc.id);
      sid.set(soc.id, hotelid);
    });

    soc.on("pending", async ({ id, res }) => {
      try {
        const bok = await GuestModel.findById(id)
          .populate("hotelId")
          .populate("agent_Id");
        if (bok) {
          if (res) {
            for (let i = 0; i < bok.ub_ids.length; i++) {
              await UpBookModel.findByIdAndUpdate(bok.ub_ids[i], {
                confirmed: true,
              });
            }
            if (bok.email) {
              sendEmail(bok);
            }
            bok.status = 1;
            await bok.save();
          } else {
            for (let i = 0; i < bok.ub_ids.length; i++) {
              await UpBookModel.findByIdAndDelete(bok.ub_ids[i]);
            }
            bok.ub_ids = [];
            bok.status = 2;
            await bok.save();
          }
          io.to(soc.id).emit("pen-success", { id });
        }
      } catch (error) {
        console.log(error);
      }
    });
  });
};
