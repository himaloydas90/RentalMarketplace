/**
 * @file authRoutes.js
 * @description Public and authenticated identity routes.
 */

const express = require("express");
const ctrl = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", protect, ctrl.me);
router.patch("/me", protect, ctrl.updateProfile);

module.exports = router;
