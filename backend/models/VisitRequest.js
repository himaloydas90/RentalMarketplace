/**
 * @file VisitRequest.js
 * @description Schedule-a-visit requests from tenants to landlords.
 * WHY: Visit scheduling is a first-class workflow (email + dashboard),
 * so it deserves its own collection instead of burying it on Property.
 */

const mongoose = require("mongoose");

const visitRequestSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    preferredDate: { type: Date, required: true },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisitRequest", visitRequestSchema);
