/**
 * @file Property.js
 * @description Listing documents for Tongi flats, messes, sublets, and offices.
 * WHY: GeoJSON `Point` + 2dsphere index powers nearby search; slug + text
 * index powers A-Z sort and keyword lookup without a separate search engine.
 */

const mongoose = require("mongoose");
const slugify = require("slugify");

const PROPERTY_TYPES = [
  "Family",
  "Bachelor-Male",
  "Bachelor-Female",
  "Sublet",
  "Mess",
  "Office",
];

const TONGI_AREAS = [
  "College Gate",
  "Cherag Ali",
  "Gazipura",
  "Station Road",
  "Bauchal",
  "IUT Area",
  "BSCIC Area",
  "Tongi Bazar",
  "Millgate",
  "Ershad Nagar",
];

const STATUSES = ["Available", "Rented", "Pending"];

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 140,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: true,
    },
    area: {
      type: String,
      enum: TONGI_AREAS,
      required: true,
    },
    addressDetails: {
      type: String,
      required: true,
      trim: true,
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    advanceMonths: {
      type: Number,
      default: 2,
      min: 0,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    balconies: { type: Number, default: 0, min: 0 },
    floorNumber: { type: String, default: "1" },
    facilities: [{ type: String, trim: true }],
    houseRules: [{ type: String, trim: true }],
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one image URL is required",
      },
    },
    videoUrl: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat] — GeoJSON order
        required: true,
      },
    },
    nearbyLandmarks: [
      {
        name: String,
        kind: String, // train | bus | road
      },
    ],
    status: {
      type: String,
      enum: STATUSES,
      default: "Pending",
    },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
    contactClicks: { type: Number, default: 0 },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

propertySchema.index({ location: "2dsphere" });
propertySchema.index({ title: "text", addressDetails: "text" });
propertySchema.index({ area: 1, propertyType: 1, rentAmount: 1, status: 1 });

/**
 * Auto-generate a unique, URL-safe slug from the Bengali/English title.
 */
propertySchema.pre("save", async function generateSlug(next) {
  if (!this.isModified("title") && this.slug) return next();

  const base = slugify(this.title, { lower: true, strict: true, locale: "en" }) || "property";
  let candidate = base;
  let i = 1;
  const Property = this.constructor;

  // Keep looping until Atlas uniqueness is guaranteed for this slug.
  // eslint-disable-next-line no-await-in-loop
  while (await Property.exists({ slug: candidate, _id: { $ne: this._id } })) {
    i += 1;
    candidate = `${base}-${i}`;
  }

  this.slug = candidate;
  next();
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
module.exports.PROPERTY_TYPES = PROPERTY_TYPES;
module.exports.TONGI_AREAS = TONGI_AREAS;
module.exports.STATUSES = STATUSES;
