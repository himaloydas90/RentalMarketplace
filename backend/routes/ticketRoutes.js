/**
 * @file ticketRoutes.js
 * @description Help-center ticket routes.
 */

const express = require("express");
const ctrl = require("../controllers/ticketController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", ctrl.create);
router.get("/", protect, authorize("admin"), ctrl.list);
router.patch("/:id", protect, authorize("admin"), ctrl.reply);

module.exports = router;
