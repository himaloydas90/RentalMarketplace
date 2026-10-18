/**
 * @file adminRoutes.js
 * @description Admin control-panel APIs (all admin-only except public reports).
 */

const express = require("express");
const ctrl = require("../controllers/adminController");
const { protect, optionalAuth, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/reports", optionalAuth, ctrl.createReport);

router.use(protect, authorize("admin"));
router.get("/stats", ctrl.stats);
router.get("/properties/pending", ctrl.pendingProperties);
router.patch("/properties/:id", ctrl.moderateProperty);
router.get("/users", ctrl.users);
router.patch("/users/:id", ctrl.updateUser);
router.get("/reports", ctrl.reports);
router.patch("/reports/:id", ctrl.updateReport);

module.exports = router;
