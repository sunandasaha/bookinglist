const { uploadFile } = require("../utils/upload");
const fs = require("fs");
const path = require("path");

const s3upload = async (req, res, next) => {
  const imgs = req.savedImages;
  for (let i = 0; i < imgs.length; i++) {
    const res = await uploadFile(imgs[i]);
    console.log(res);

    if (res) {
      fs.unlink(path.join(__dirname, "..", "uploads", imgs[i]), (err) => {
        if (err) console.log(err);
      });
    }
  }

  next();
};

module.exports = { s3upload };
