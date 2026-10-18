/**
 * @file reviewController.js
 * @description Create and list reviews for a listing.
 */

const Review = require("../models/Review");
const Property = require("../models/Property");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

exports.create = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.body.propertyId);
  if (!property) throw new ApiError(404, "Property not found");

  const review = await Review.create({
    property: property._id,
    user: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  res.status(201).json({ success: true, review });
});
