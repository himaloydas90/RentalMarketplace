/**
 * @file propertyService.js
 * @description Query builder for listing search, geo, sort, and pagination.
 * WHY: Controllers stay thin; this service owns Mongo filters so A-Z, price,
 * geospatial, and URL query params stay consistent with the frontend.
 */

const Property = require("../models/Property");

const SORT_MAP = {
  "a-z": { title: 1 },
  "z-a": { title: -1 },
  "price-asc": { rentAmount: 1 },
  "price-desc": { rentAmount: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

/**
 * Build a Mongo filter from query-string params.
 * @param {Record<string, string>} query
 */
function buildFilter(query) {
  const filter = {};

  if (query.status) filter.status = query.status;
  else filter.status = { $in: ["Available", "Rented"] };

  if (query.area) filter.area = query.area;
  if (query.propertyType) filter.propertyType = query.propertyType;

  if (query.minRent || query.maxRent) {
    filter.rentAmount = {};
    if (query.minRent) filter.rentAmount.$gte = Number(query.minRent);
    if (query.maxRent) filter.rentAmount.$lte = Number(query.maxRent);
  }

  if (query.facilities) {
    const list = String(query.facilities)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length) filter.facilities = { $all: list };
  }

  if (query.q) {
    filter.$or = [
      { title: { $regex: query.q, $options: "i" } },
      { addressDetails: { $regex: query.q, $options: "i" } },
      { area: { $regex: query.q, $options: "i" } },
    ];
  }

  if (query.featured === "true") filter.isFeatured = true;
  if (query.verified === "true") filter.isVerified = true;

  // Geo: $geoWithin+$centerSphere works with countDocuments (unlike $near).
  if (query.lng && query.lat) {
    const radiusKm = Number(query.radiusKm) || 3;
    filter.location = {
      $geoWithin: {
        $centerSphere: [[Number(query.lng), Number(query.lat)], radiusKm / 6378.1],
      },
    };
  }

  return filter;
}

/**
 * Paginated listing search used by GET /properties.
 */
async function searchProperties(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(24, Math.max(1, Number(query.limit) || 9));
  const skip = (page - 1) * limit;
  const sort = SORT_MAP[query.sort] || SORT_MAP.newest;
  const filter = buildFilter(query);

  // `$near` cannot combine with skip/count in some Atlas versions the same way;
  // we still paginate after the geo filter for a consistent API contract.
  const [items, total] = await Promise.all([
    Property.find(filter)
      .populate("landlord", "name phone avatar isVerified")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = { searchProperties, SORT_MAP, buildFilter };
