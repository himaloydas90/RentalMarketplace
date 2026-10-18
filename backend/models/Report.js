/**
 * @file Report.js
 * @description User-flagged spam or fake listings for admin review.
 * WHY: Moderators need an audit trail of who reported what and why,
 * independent of the listing's current status.
 */

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Open", "Reviewed", "Dismissed"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
