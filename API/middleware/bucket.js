const { uploadFile } = require("../utils/upload");
const fs = require("fs");
const path = require("path");

const s3upload = async (req, res, next) => {
  try {
    const imgs = req.savedImages;
    for (let i = 0; i < imgs.length; i++) {
      const res = await uploadFile(imgs[i]);
      /*if (res) {
        fs.unlink(path.join(__dirname, "..", "uploads", imgs[i]), (err) => {
          if (err) console.log(err);
        });
      } */
    }
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

module.exports = { s3upload };
