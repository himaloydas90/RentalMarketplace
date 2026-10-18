/**
 * @file uploadController.js
 * @description Stream Multer buffers to Cloudinary with Unsplash fallback.
 * WHY: Listings must never ship with broken images; if Cloudinary is down
 * we still return high-quality Unsplash real-estate URLs.
 */

const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

const FALLBACKS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c54be0?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1484154216900-6a0b2d78c8d1?auto=format&fit=crop&w=1600&q=80",
];

function uploadBuffer(file, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: file.mimetype.startsWith("video") ? "video" : "image" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

exports.uploadMedia = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const urls = [];

  for (let i = 0; i < files.length; i += 1) {
    try {
      // Sequential uploads keep Cloudinary rate limits predictable.
      // eslint-disable-next-line no-await-in-loop
      const url = await uploadBuffer(files[i], "tongi-rentals");
      urls.push(url);
    } catch (err) {
      console.error("[cloudinary] fallback used", err.message);
      urls.push(FALLBACKS[i % FALLBACKS.length]);
    }
  }

  if (!urls.length) urls.push(FALLBACKS[0]);
  res.json({ success: true, urls });
});
