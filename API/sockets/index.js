const GuestModel = require("../models/GuestBooking");
const UpBookModel = require("../models/UpcomingBookings");

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
        const book = await GuestModel.findById(id);
        if (book) {
          if (res) {
            for (let i = 0; i < book.ub_ids.length; i++) {
              await UpBookModel.findByIdAndUpdate(book.ub_ids[i], {
                confirmed: true,
              });
            }
            book.status = 1;
            await book.save();
          } else {
            for (let i = 0; i < book.ub_ids.length; i++) {
              await UpBookModel.findByIdAndDelete(book.ub_ids[i]);
            }
            book.ub_ids = [];
            book.status = 2;
            await book.save();
          }
          io.to(soc.id).emit("pen-success", { id });
        }
      } catch (error) {
        console.log(error);
      }
    });
  });
};
