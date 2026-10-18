/**
 * @file mailer.js
 * @description HTML email sender via Nodemailer + Gmail SMTP.
 * WHY: Visit confirmations and ticket replies must look branded, so we
 * wrap SMTP behind a small template helper instead of sending raw text.
 */

const nodemailer = require("nodemailer");
const env = require("../config/env");

const transporter = nodemailer.createTransport({
  service: env.smtp.service,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

/**
 * Send a branded HTML email.
 * @param {{ to: string, subject: string, html: string }} options
 */
async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"${env.appName}" <${env.smtp.user}>`,
    to,
    subject,
    html,
  });
}

/**
 * Visit-request notification for the landlord.
 */
function visitRequestTemplate({ landlordName, tenantName, propertyTitle, date, note }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:16px">
      <h2 style="color:#f8fafc">টঙ্গী বাসা ভাড়া — Visit Request</h2>
      <p>Assalamu alaikum ${landlordName},</p>
      <p><strong>${tenantName}</strong> wants to visit <strong>${propertyTitle}</strong>.</p>
      <p>Preferred date: <strong>${date}</strong></p>
      <p>Note: ${note || "—"}</p>
      <p style="color:#94a3b8;font-size:13px">Please log in to your dashboard to accept or decline.</p>
    </div>
  `;
}

function ticketReplyTemplate({ name, subject, reply }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:16px">
      <h2 style="color:#f8fafc">${env.appName} Support</h2>
      <p>Hello ${name},</p>
      <p>We replied to your ticket: <strong>${subject}</strong></p>
      <blockquote style="border-left:3px solid #38bdf8;padding-left:12px">${reply}</blockquote>
    </div>
  `;
}

module.exports = { sendMail, visitRequestTemplate, ticketReplyTemplate };
