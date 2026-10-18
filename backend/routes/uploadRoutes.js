/**
 * @file uploadRoutes.js
 * @description Multipart image/video upload to Cloudinary.
 */

const express = require("express");
const ctrl = require("../controllers/uploadController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("landlord", "admin"),
  upload.array("files", 12),
  ctrl.uploadMedia
);

module.exports = router;
