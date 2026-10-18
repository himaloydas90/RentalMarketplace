/**
 * @file visitRoutes.js
 * @description Schedule-visit endpoints.
 */

const express = require("express");
const ctrl = require("../controllers/visitController");
const { protect, optionalAuth, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", optionalAuth, ctrl.create);
router.get("/landlord", protect, authorize("landlord", "admin"), ctrl.forLandlord);
router.patch("/:id", protect, authorize("landlord", "admin"), ctrl.updateStatus);

module.exports = router;
