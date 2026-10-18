/**
 * @file ticketController.js
 * @description Help-center tickets for public submit + admin reply.
 */

const Ticket = require("../models/Ticket");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendMail, ticketReplyTemplate } = require("../utils/mailer");

exports.create = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    throw new ApiError(400, "All ticket fields are required");
  }
  const ticket = await Ticket.create({ name, email, subject, message });
  res.status(201).json({ success: true, ticket });
});

exports.list = asyncHandler(async (req, res) => {
  const items = await Ticket.find().sort({ createdAt: -1 });
  res.json({ success: true, items });
});

exports.reply = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, "Ticket not found");
  ticket.adminReply = req.body.adminReply || ticket.adminReply;
  ticket.status = req.body.status || "In-Progress";
  await ticket.save();

  try {
    await sendMail({
      to: ticket.email,
      subject: `Re: ${ticket.subject}`,
      html: ticketReplyTemplate({
        name: ticket.name,
        subject: ticket.subject,
        reply: ticket.adminReply,
      }),
    });
  } catch (err) {
    console.error("[mailer] ticket reply failed", err.message);
  }

  res.json({ success: true, ticket });
});
