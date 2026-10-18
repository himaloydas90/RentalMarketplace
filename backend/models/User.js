/**
 * @file User.js
 * @description Tenant, landlord, and admin accounts for the marketplace.
 * WHY: A single User collection with a `role` discriminator keeps auth,
 * bookmarks, and ownership queries in one place while RBAC middleware
 * still gates privileged routes.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["tenant", "landlord", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // Never return hashes unless explicitly selected
    },
    phone: {
      type: String,
      required: [true, "Phone is required for Call/WhatsApp"],
      trim: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "tenant",
    },
    nidNumber: {
      type: String,
      trim: true,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
  },
  { timestamps: true }
);

/**
 * Hash passwords on create/update so plaintext never hits Atlas.
 */
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare a candidate password against the stored bcrypt hash.
 * @param {string} candidate
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    nidNumber: this.nidNumber,
    isVerified: this.isVerified,
    isBanned: this.isBanned,
    avatar: this.avatar,
    savedProperties: this.savedProperties,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
