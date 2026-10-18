/**
 * @file authController.js
 * @description Register, login, refresh, and profile endpoints.
 */

const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");
const env = require("../config/env");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function attachTokens(res, user) {
  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: user._id.toString() });
  res.cookie("refreshToken", refreshToken, cookieOptions);
  return { accessToken, refreshToken };
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password || !phone) {
    throw new ApiError(400, "Name, email, phone, and password are required");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "An account with this email already exists");

  const allowedRole = role === "landlord" ? "landlord" : "tenant";
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: allowedRole,
  });

  const tokens = attachTokens(res, user);
  res.status(201).json({ success: true, user: user.toSafeJSON(), ...tokens });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.isBanned) throw new ApiError(403, "This account has been suspended");

  const tokens = attachTokens(res, user);
  res.json({ success: true, user: user.toSafeJSON(), ...tokens });
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Refresh token invalid");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "Account no longer exists");

  const tokens = attachTokens(res, user);
  res.json({ success: true, user: user.toSafeJSON(), ...tokens });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Signed out" });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const fields = ["name", "phone", "nidNumber", "avatar"];
  fields.forEach((key) => {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  });
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeJSON() });
});
