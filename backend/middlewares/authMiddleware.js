/**
 * @file authMiddleware.js
 * @description JWT access-token guard + role-based access control.
 * WHY: Route files stay declarative (`protect`, `authorize('admin')`) while
 * this module owns token parsing, ban checks, and user hydration.
 */

const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/tokens");

/**
 * Extract Bearer token from Authorization header or httpOnly cookie.
 */
function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.accessToken;
}

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, "Please sign in to continue");

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "Account no longer exists");
  if (user.isBanned) throw new ApiError(403, "This account has been suspended");

  req.user = user;
  next();
});

/**
 * Optional auth — populates req.user when a token is present.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id);
  } catch {
    // Public routes should still work with a stale token.
  }
  next();
});

/**
 * Restrict a route to one or more roles.
 * @param {...string} roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission for this action"));
    }
    next();
  };
}

module.exports = { protect, optionalAuth, authorize };
