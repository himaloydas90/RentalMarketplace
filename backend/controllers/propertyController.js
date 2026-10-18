/**
 * @file propertyController.js
 * @description CRUD, search, views, bookmarks, and contact-click tracking.
 */

const Property = require("../models/Property");
const User = require("../models/User");
const Review = require("../models/Review");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { searchProperties } = require("../services/propertyService");

exports.list = asyncHandler(async (req, res) => {
  const data = await searchProperties(req.query);
  res.json({ success: true, ...data });
});

exports.featured = asyncHandler(async (req, res) => {
  const items = await Property.find({ isFeatured: true, status: "Available" })
    .populate("landlord", "name phone avatar isVerified")
    .sort({ createdAt: -1 })
    .limit(8);
  res.json({ success: true, items });
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ slug: req.params.slug }).populate(
    "landlord",
    "name phone avatar isVerified role"
  );
  if (!property) throw new ApiError(404, "Property not found");

  property.viewsCount += 1;
  await property.save({ validateBeforeSave: false });

  const reviews = await Review.find({ property: property._id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  res.json({ success: true, property, reviews });
});

exports.create = asyncHandler(async (req, res) => {
  const body = { ...req.body, landlord: req.user._id, status: "Pending" };
  if (typeof body.facilities === "string") body.facilities = body.facilities.split(",").map((s) => s.trim());
  if (typeof body.houseRules === "string") body.houseRules = body.houseRules.split(",").map((s) => s.trim());
  if (typeof body.images === "string") body.images = body.images.split(",").map((s) => s.trim());
  if (body.lng && body.lat) {
    body.location = { type: "Point", coordinates: [Number(body.lng), Number(body.lat)] };
  }
  const property = await Property.create(body);
  res.status(201).json({ success: true, property });
});

exports.update = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");
  const isOwner = property.landlord.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You can only edit your own listings");
  }

  const allowed = [
    "title",
    "propertyType",
    "area",
    "addressDetails",
    "rentAmount",
    "serviceCharge",
    "advanceMonths",
    "availableFrom",
    "bedrooms",
    "bathrooms",
    "balconies",
    "floorNumber",
    "facilities",
    "houseRules",
    "images",
    "videoUrl",
    "status",
    "nearbyLandmarks",
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) property[key] = req.body[key];
  });
  if (req.body.lng && req.body.lat) {
    property.location = { type: "Point", coordinates: [Number(req.body.lng), Number(req.body.lat)] };
  }
  await property.save();
  res.json({ success: true, property });
});

exports.remove = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");
  const isOwner = property.landlord.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") throw new ApiError(403, "Forbidden");
  await property.deleteOne();
  res.json({ success: true, message: "Listing deleted" });
});

exports.mine = asyncHandler(async (req, res) => {
  const items = await Property.find({ landlord: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, items });
});

exports.toggleSave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const exists = user.savedProperties.some((p) => p.toString() === id);
  if (exists) user.savedProperties = user.savedProperties.filter((p) => p.toString() !== id);
  else user.savedProperties.push(id);
  await user.save();
  res.json({ success: true, saved: !exists, savedProperties: user.savedProperties });
});

exports.saved = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "savedProperties",
    populate: { path: "landlord", select: "name phone avatar isVerified" },
  });
  res.json({ success: true, items: user.savedProperties });
});

exports.trackContact = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { $inc: { contactClicks: 1 } },
    { new: true }
  );
  if (!property) throw new ApiError(404, "Property not found");
  res.json({ success: true, contactClicks: property.contactClicks });
});
