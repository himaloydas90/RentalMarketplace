/**
 * @file Ticket.js
 * @description Help-center support tickets for tenants and landlords.
 * WHY: Public visitors can submit without an account; admins later reply
 * and flip status from Open → In-Progress → Resolved.
 */

const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["Open", "In-Progress", "Resolved"],
      default: "Open",
    },
    adminReply: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
