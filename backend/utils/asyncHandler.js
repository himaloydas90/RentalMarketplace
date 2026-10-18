/**
 * @file asyncHandler.js
 * @description Wrap async Express handlers so rejected promises become 500s.
 * WHY: Avoids repeating try/catch in every controller while still producing
 * consistent JSON errors via the global error middleware.
 */

/**
 * @param {(req, res, next) => Promise<unknown>} fn
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
