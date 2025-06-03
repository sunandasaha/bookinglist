require("dotenv").config();
const { createHmac, createCipheriv, createDecipheriv } = require("crypto");

const encrypt = (uname, data) => {
  const key = Buffer.from(process.env.KEY, "hex");
  const iv = createHmac("sha256", process.env.SECRET)
    .update(uname)
    .digest("base64")
    .substring(0, 16);
  const cipher = createCipheriv("aes-192-cbc", key, iv);
  const cards = cipher.update(data, "utf-8", "latin1") + cipher.final("latin1");

  return cards;
};

const decrypt = (uname, data) => {
  const key = Buffer.from(process.env.KEY, "hex");
  const iv = createHmac("sha256", process.env.SECRET)
    .update(uname)
    .digest("base64")
    .substring(0, 16);
  const dcipher = createDecipheriv("aes-192-cbc", key, iv);
  const cards =
    dcipher.update(data, "latin1", "utf-8") + dcipher.final("utf-8");
  return cards;
};

module.exports = { encrypt, decrypt };
