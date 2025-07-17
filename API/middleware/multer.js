const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Create 'uploads' folder if it doesn't exist
const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Multer setup - store in memory
const storage = multer.memoryStorage();
const upload = multer({ storage, fileFilter: imageFileFilter });

// Middleware to handle multiple image upload and resizing
const resizeAndSaveImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    req.savedImages = [];
    next();
  }

  try {
    const processedFiles = await Promise.all(
      req.files.map(async (file, index) => {
        const filename = `image-${Date.now()}-${index}.jpeg`;
        const filepath = path.join(uploadPath, filename);

        await sharp(file.buffer)
          .resize(800, 800, { fit: "inside" }) // Resize image
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(filepath);

        return filename;
      })
    );

    // Attach processed file names to request
    req.savedImages = processedFiles;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image processing failed" });
  }
};

module.exports = {
  uploadImages: upload.array("images", 4), // field name = 'images'
  resizeAndSaveImages,
};
