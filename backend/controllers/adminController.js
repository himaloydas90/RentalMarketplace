/**
 * @file adminController.js
 * @description Moderation, verification, users, reports, and analytics.
 */

const User = require("../models/User");
const Property = require("../models/Property");
const Report = require("../models/Report");
const Ticket = require("../models/Ticket");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

exports.stats = asyncHandler(async (req, res) => {
  const [users, landlords, properties, pending, tickets, reports] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "landlord" }),
    Property.countDocuments(),
    Property.countDocuments({ status: "Pending" }),
    Ticket.countDocuments({ status: { $ne: "Resolved" } }),
    Report.countDocuments({ status: "Open" }),
  ]);

  const monthly = await Property.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        listings: { $sum: 1 },
        rentSum: { $sum: "$rentAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      users,
      landlords,
      properties,
      pending,
      tickets,
      reports,
      estimatedMonthlyRevenue: monthly.reduce((acc, m) => acc + m.rentSum * 0.03, 0),
      monthly,
    },
  });
});

exports.pendingProperties = asyncHandler(async (req, res) => {
  const items = await Property.find({ status: "Pending" })
    .populate("landlord", "name email phone")
    .sort({ createdAt: -1 });
  res.json({ success: true, items });
});

exports.moderateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");
  const { action, reason, isVerified, isFeatured } = req.body;

  if (action === "approve") {
    property.status = "Available";
    property.rejectionReason = "";
  } else if (action === "reject") {
    property.status = "Pending";
    property.rejectionReason = reason || "Rejected by admin";
  }
  if (typeof isVerified === "boolean") property.isVerified = isVerified;
  if (typeof isFeatured === "boolean") property.isFeatured = isFeatured;
  await property.save();
  res.json({ success: true, property });
});

exports.users = asyncHandler(async (req, res) => {
  const items = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, items: items.map((u) => u.toSafeJSON()) });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (req.body.role) user.role = req.body.role;
  if (typeof req.body.isBanned === "boolean") user.isBanned = req.body.isBanned;
  if (typeof req.body.isVerified === "boolean") user.isVerified = req.body.isVerified;
  await user.save();
  res.json({ success: true, user: user.toSafeJSON() });
});

exports.reports = asyncHandler(async (req, res) => {
  const items = await Report.find()
    .populate("property", "title slug status")
    .populate("reporter", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, items });
});

exports.createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({
    property: req.body.propertyId,
    reporter: req.user?._id,
    reason: req.body.reason,
  });
  res.status(201).json({ success: true, report });
});

exports.updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found");
  report.status = req.body.status || report.status;
  await report.save();
  res.json({ success: true, report });
});
