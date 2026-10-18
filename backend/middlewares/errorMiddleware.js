/**
 * @file errorMiddleware.js
 * @description Global Express error + 404 handlers.
 * WHY: A single JSON shape (`success`, `message`) keeps the Next.js client
 * error parsing simple and prevents leaking stack traces in production.
 */

const env = require("../config/env");

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    stack: env.nodeEnv === "development" ? err.stack : undefined,
  });
}

module.exports = { notFound, errorHandler };
