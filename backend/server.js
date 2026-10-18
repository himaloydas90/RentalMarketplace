/**
 * @file server.js
 * @description Express HTTP entry for Tongi Rental Marketplace.
 * WHY: All API traffic is namespaced under BASE_URL so Next.js can reverse-proxy
 * `/backend-api/v1/*` without colliding with App Router pages.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const { connectDatabase } = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const visitRoutes = require("./routes/visitRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const api = env.baseUrl;

app.get(`${api}/health`, (req, res) => {
  res.json({ success: true, app: env.appName, time: new Date().toISOString() });
});

app.use(`${api}/auth`, authRoutes);
app.use(`${api}/properties`, propertyRoutes);
app.use(`${api}/visits`, visitRoutes);
app.use(`${api}/tickets`, ticketRoutes);
app.use(`${api}/admin`, adminRoutes);
app.use(`${api}/uploads`, uploadRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`[server] ${env.appName} API on :${env.port}${api}`);
  });
}

start().catch((err) => {
  console.error("[server] failed to boot", err);
  process.exit(1);
});
