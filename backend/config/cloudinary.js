/**
 * @file cloudinary.js
 * @description Cloudinary SDK bootstrap for multi-image/video uploads.
 * WHY: Controllers should never hard-code credentials; this module injects
 * the validated env secrets once at process start.
 */

const cloudinary = require("cloudinary").v2;
const env = require("./env");

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

module.exports = cloudinary;
