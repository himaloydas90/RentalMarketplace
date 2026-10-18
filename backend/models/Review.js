/**
 * @file Review.js
 * @description Tenant ratings on a listing after a visit or stay.
 * WHY: Stored separately so property documents stay lean while average
 * ratings can still be aggregated with `$lookup`.
 */

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 800,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
