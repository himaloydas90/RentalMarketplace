/**
 * @file apiError.js
 * @description Typed HTTP errors with a user-facing message.
 * WHY: Controllers throw `ApiError` instead of sending ad-hoc JSON so the
 * error middleware can map status codes uniformly.
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

module.exports = ApiError;
