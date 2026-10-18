/**
 * @file propertyRoutes.js
 * @description Listing search, detail, landlord CRUD, and bookmarks.
 */

const express = require("express");
const ctrl = require("../controllers/propertyController");
const reviewCtrl = require("../controllers/reviewController");
const { protect, optionalAuth, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", optionalAuth, ctrl.list);
router.get("/featured", ctrl.featured);
router.get("/mine", protect, authorize("landlord", "admin"), ctrl.mine);
router.get("/saved", protect, ctrl.saved);
router.get("/:slug", ctrl.getBySlug);
router.post("/", protect, authorize("landlord", "admin"), ctrl.create);
router.patch("/:id", protect, authorize("landlord", "admin"), ctrl.update);
router.delete("/:id", protect, authorize("landlord", "admin"), ctrl.remove);
router.post("/:id/save", protect, ctrl.toggleSave);
router.post("/:id/contact-click", ctrl.trackContact);
router.post("/reviews", protect, reviewCtrl.create);

module.exports = router;
