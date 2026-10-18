/**
 * @file tokens.js
 * @description JWT issue/verify helpers for access, refresh, and temp tokens.
 * WHY: Isolating crypto keeps secrets out of controllers and makes expiry
 * policy a single-file change.
 */

const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * @param {{ id: string, role: string }} payload
 */
function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

/**
 * @param {{ id: string }} payload
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

/**
 * Short-lived token used for email verification / password reset.
 * @param {{ id: string, purpose: string }} payload
 */
function signTempToken(payload) {
  return jwt.sign(payload, env.jwt.tempSecret, {
    expiresIn: env.jwt.tempExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  signTempToken,
  verifyAccessToken,
  verifyRefreshToken,
};
