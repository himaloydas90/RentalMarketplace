/**
 * @file visitController.js
 * @description Schedule-a-visit flow with landlord email notification.
 */

const VisitRequest = require("../models/VisitRequest");
const Property = require("../models/Property");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendMail, visitRequestTemplate } = require("../utils/mailer");

exports.create = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.body.propertyId).populate("landlord");
  if (!property) throw new ApiError(404, "Property not found");

  const visit = await VisitRequest.create({
    property: property._id,
    tenant: req.user?._id,
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    preferredDate: req.body.preferredDate,
    note: req.body.note || "",
  });

  try {
    await sendMail({
      to: property.landlord.email,
      subject: `Visit request: ${property.title}`,
      html: visitRequestTemplate({
        landlordName: property.landlord.name,
        tenantName: req.body.name,
        propertyTitle: property.title,
        date: new Date(req.body.preferredDate).toLocaleString("en-BD"),
        note: req.body.note,
      }),
    });
  } catch (err) {
    // Email failure should not block the booking record.
    console.error("[mailer] visit email failed", err.message);
  }

  res.status(201).json({ success: true, visit });
});

exports.forLandlord = asyncHandler(async (req, res) => {
  const properties = await Property.find({ landlord: req.user._id }).select("_id");
  const ids = properties.map((p) => p._id);
  const items = await VisitRequest.find({ property: { $in: ids } })
    .populate("property", "title slug images")
    .sort({ createdAt: -1 });
  res.json({ success: true, items });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const visit = await VisitRequest.findById(req.params.id).populate("property");
  if (!visit) throw new ApiError(404, "Visit request not found");
  if (visit.property.landlord.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden");
  }
  visit.status = req.body.status;
  await visit.save();
  res.json({ success: true, visit });
});
