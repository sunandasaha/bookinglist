const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const REGION = "ap-south-1";
const BUCKET_NAME = "bookinglist-bucket";
const ACCESS_KEY = process.env.S3_ACCESS_TOKEN || "";
const SECRET_KEY = process.env.S3_SECRET_KEY || "";
const ENDPOINT = "https://bookinglist-bucket.s3.ap-south-1.amazonaws.com";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  endpoint: ENDPOINT,
  forcePathStyle: true,
});

async function uploadFile(key) {
  const fileStream = fs.createReadStream(
    path.join(__dirname, "..", "uploads", key)
  );
  const contentType = mime.lookup(key) || "application/octet-stream";

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
      ACL: "public-read",
    },
  });

  try {
    await upload.done();
    return true;
  } catch (err) {
    console.error("❌ Upload failed for key:", key, err.message);
    return false;
  }
}

async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await s3.send(command);
  } catch (err) {
    console.error(`❌ Failed to delete '${key}':`, err.message);
  }
}

module.exports = { uploadFile, deleteFile };
