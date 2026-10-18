/**
 * @file env.js
 * @description Central environment loader for the Express API.
 * WHY: A single validated config object avoids scattering `process.env`
 * reads across controllers and makes missing secrets fail fast at boot.
 */

const path = require("path");
const dotenv = require("dotenv");

// Load the monorepo-root .env so backend and Next.js share one source of truth.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Require a variable or throw a clear startup error.
 * @param {string} key
 * @returns {string}
 */
function required(key) {
  const value = process.env[key];
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 8000,
  dbUrl: required("DB_URL"),
  baseUrl: process.env.BASE_URL || "/backend-api/v1",
  appName: process.env.APP_NAME || "Tongi Rental Marketplace",

  cloudinary: {
    cloudName: required("CLOUDINARY_CLOUD_NAME"),
    apiKey: required("CLOUDINARY_API_KEY"),
    apiSecret: required("CLOUDINARY_API_SECRET"),
  },

  smtp: {
    service: process.env.SMTP_SERVICE || "gmail",
    user: required("SMTP_NAME"),
    password: required("SMTP_PASSWORD"),
  },

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    tempSecret: required("JWT_TEMP_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    tempExpiresIn: process.env.JWT_TEMP_EXPIRES_IN || "1h",
  },

  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
};

module.exports = env;
