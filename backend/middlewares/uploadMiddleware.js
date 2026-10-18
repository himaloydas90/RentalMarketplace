/**
 * @file uploadMiddleware.js
 * @description Multer memory storage for Cloudinary streaming uploads.
 * WHY: Memory storage avoids writing temp files on the server; Cloudinary
 * receives a buffer. If Cloudinary fails, controllers fall back to Unsplash.
 */

const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ok = /image|video/.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error("Only image and video files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024, files: 12 },
});

module.exports = upload;
