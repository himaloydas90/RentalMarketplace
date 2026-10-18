/**
 * @file seed.js
 * @description Idempotent Atlas seed: 3 users + 12 Tongi listings + reviews.
 * WHY: The marketplace should look live on first launch with real-estate
 * Unsplash photography and Tongi-specific copy (never Lorem Ipsum).
 *
 * Usage: `npm run seed` from /backend (or `npm run seed` at repo root).
 */

const { connectDatabase } = require("./config/db");
const User = require("./models/User");
const Property = require("./models/Property");
const Review = require("./models/Review");
const Ticket = require("./models/Ticket");
const mongoose = require("mongoose");

const IMG = {
  living: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  kitchen: "https://images.unsplash.com/photo-1556912173-3d5e0320c7b4?auto=format&fit=crop&w=1600&q=80",
  bath: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=80",
  bedroom: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80",
  exterior: "https://images.unsplash.com/photo-1560448204-e02f11c54be0?auto=format&fit=crop&w=1600&q=80",
  balcony: "https://images.unsplash.com/photo-1484154216900-6a0b2d78c8d1?auto=format&fit=crop&w=1600&q=80",
  loft: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  mess: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80",
  family: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
  studio: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
  night: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
  corridor: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d95?auto=format&fit=crop&w=1600&q=80",
  dining: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
};

const AVATARS = {
  admin: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  landlord: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  tenant: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
};

function point(lng, lat) {
  return { type: "Point", coordinates: [lng, lat] };
}

async function seed() {
  await connectDatabase();

  console.log("[seed] Clearing previous demo collections…");
  await Promise.all([
    User.deleteMany({ email: /@(tongirental|demo)\.bd$/i }),
    Property.deleteMany({}),
    Review.deleteMany({}),
    Ticket.deleteMany({ subject: /seed/i }),
  ]);

  const admin = await User.create({
    name: "Himaloy Admin",
    email: "admin@tongirental.bd",
    password: "Password123!",
    phone: "01711000001",
    role: "admin",
    isVerified: true,
    avatar: AVATARS.admin,
    nidNumber: "1990123456789",
  });

  const landlord = await User.create({
    name: "Karim Uddin",
    email: "landlord@tongirental.bd",
    password: "Password123!",
    phone: "01711222333",
    role: "landlord",
    isVerified: true,
    avatar: AVATARS.landlord,
    nidNumber: "1985123456789",
  });

  const tenant = await User.create({
    name: "Nusrat Jahan",
    email: "tenant@tongirental.bd",
    password: "Password123!",
    phone: "01819888777",
    role: "tenant",
    isVerified: true,
    avatar: AVATARS.tenant,
  });

  const listings = [
    {
      title: "3 BHK Modern Family Flat near Tongi College Gate",
      propertyType: "Family",
      area: "College Gate",
      addressDetails: "House 14, Road 3, College Gate, Tongi, Gazipur",
      rentAmount: 22000,
      serviceCharge: 2500,
      advanceMonths: 2,
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      floorNumber: "4",
      facilities: ["Lift", "Generator", "Parking", "Line Gas", "CCTV", "WiFi"],
      houseRules: ["Gate closes 11:30 PM", "Family tenants only", "No loud music after 10 PM"],
      images: [IMG.family, IMG.living, IMG.kitchen, IMG.bath, IMG.balcony],
      location: point(90.4021, 23.8912),
      isVerified: true,
      isFeatured: true,
      status: "Available",
      nearbyLandmarks: [
        { name: "Tongi College Gate", kind: "road" },
        { name: "Tongi Railway Station", kind: "train" },
      ],
    },
    {
      title: "Bachelor Female Seat near IUT Zone",
      propertyType: "Bachelor-Female",
      area: "IUT Area",
      addressDetails: "Boarder lane, 3 min walk from IUT south gate",
      rentAmount: 6500,
      serviceCharge: 800,
      advanceMonths: 1,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 1,
      floorNumber: "2",
      facilities: ["WiFi", "CCTV", "Prepaid Gas"],
      houseRules: ["Female tenants only", "Guests until 8 PM", "Gate closes 10:30 PM"],
      images: [IMG.bedroom, IMG.living, IMG.bath],
      location: point(90.3804, 23.9481),
      isVerified: true,
      isFeatured: true,
      status: "Available",
    },
    {
      title: "Spacious Flat with Line Gas in Gazipura",
      propertyType: "Family",
      area: "Gazipura",
      addressDetails: "Gazipura Main Road, opposite City Bank ATM",
      rentAmount: 18000,
      serviceCharge: 1500,
      advanceMonths: 2,
      bedrooms: 3,
      bathrooms: 2,
      balconies: 1,
      floorNumber: "3",
      facilities: ["Line Gas", "Parking", "Generator", "South-facing"],
      houseRules: ["Family preferred", "Pets not allowed"],
      images: [IMG.dining, IMG.kitchen, IMG.living, IMG.bath],
      location: point(90.4152, 23.9104),
      isVerified: true,
      isFeatured: true,
      status: "Available",
    },
    {
      title: "2 Bed Flat at BSCIC Industrial Area",
      propertyType: "Family",
      area: "BSCIC Area",
      addressDetails: "BSCIC Industrial Estate, Block C, Tongi",
      rentAmount: 14000,
      serviceCharge: 1200,
      advanceMonths: 2,
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      floorNumber: "5",
      facilities: ["Parking", "CCTV", "Prepaid Gas"],
      houseRules: ["Factory-shift quiet hours 6 AM–8 AM"],
      images: [IMG.exterior, IMG.living, IMG.kitchen],
      location: point(90.4301, 23.9052),
      isVerified: true,
      status: "Available",
    },
    {
      title: "Bachelor Male Mess near Station Road",
      propertyType: "Mess",
      area: "Station Road",
      addressDetails: "Station Road, 2 minutes from Tongi rail overbridge",
      rentAmount: 4500,
      serviceCharge: 500,
      advanceMonths: 1,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 0,
      floorNumber: "1",
      facilities: ["WiFi", "CCTV", "Generator"],
      houseRules: ["Male only", "No overnight guests", "Shared kitchen roster"],
      images: [IMG.mess, IMG.corridor, IMG.kitchen],
      location: point(90.4083, 23.8971),
      isVerified: true,
      isFeatured: true,
      status: "Available",
    },
    {
      title: "Sublet Room in Cherag Ali with Attached Bath",
      propertyType: "Sublet",
      area: "Cherag Ali",
      addressDetails: "Cherag Ali Bazar road, 3rd floor, south-facing room",
      rentAmount: 8000,
      serviceCharge: 700,
      advanceMonths: 1,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 1,
      floorNumber: "3",
      facilities: ["South-facing", "WiFi", "Line Gas"],
      houseRules: ["Shared drawing room", "Cooking in common kitchen only"],
      images: [IMG.studio, IMG.bath, IMG.balcony],
      location: point(90.3954, 23.8853),
      status: "Available",
    },
    {
      title: "Office Space on Tongi Bazar 1st Floor",
      propertyType: "Office",
      area: "Tongi Bazar",
      addressDetails: "Tongi Bazar main artery, above Agrani Bank",
      rentAmount: 28000,
      serviceCharge: 4000,
      advanceMonths: 3,
      bedrooms: 0,
      bathrooms: 2,
      balconies: 0,
      floorNumber: "1",
      facilities: ["Lift", "Generator", "CCTV", "Parking", "WiFi"],
      houseRules: ["Commercial hours 8 AM–8 PM", "No residential use"],
      images: [IMG.office, IMG.corridor, IMG.exterior],
      location: point(90.4055, 23.8998),
      isVerified: true,
      status: "Available",
    },
    {
      title: "Family Duplex vibe Flat at Millgate",
      propertyType: "Family",
      area: "Millgate",
      addressDetails: "Millgate, near former Adamjee mill staff quarters",
      rentAmount: 16000,
      serviceCharge: 1800,
      advanceMonths: 2,
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      floorNumber: "2",
      facilities: ["Parking", "Line Gas", "Generator", "South-facing"],
      houseRules: ["Family only", "Gate closes 11 PM"],
      images: [IMG.loft, IMG.living, IMG.kitchen, IMG.bedroom],
      location: point(90.412, 23.888),
      isFeatured: true,
      status: "Available",
    },
    {
      title: "Bachelor Male Seat in Bauchal near Bus Stand",
      propertyType: "Bachelor-Male",
      area: "Bauchal",
      addressDetails: "Bauchal bus stand lane, 2nd floor",
      rentAmount: 5500,
      serviceCharge: 600,
      advanceMonths: 1,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 0,
      floorNumber: "2",
      facilities: ["WiFi", "Prepaid Gas"],
      houseRules: ["Male only", "Guests until 9 PM"],
      images: [IMG.bedroom, IMG.mess, IMG.bath],
      location: point(90.398, 23.902),
      status: "Available",
    },
    {
      title: "Premium 4 Bed South-facing Home in Ershad Nagar",
      propertyType: "Family",
      area: "Ershad Nagar",
      addressDetails: "Ershad Nagar residential block, corner plot",
      rentAmount: 32000,
      serviceCharge: 3500,
      advanceMonths: 3,
      bedrooms: 4,
      bathrooms: 3,
      balconies: 3,
      floorNumber: "6",
      facilities: ["Lift", "Generator", "Parking", "Line Gas", "CCTV", "WiFi", "South-facing"],
      houseRules: ["Family only", "No commercial activity"],
      images: [IMG.night, IMG.living, IMG.kitchen, IMG.bath, IMG.balcony],
      location: point(90.392, 23.918),
      isVerified: true,
      isFeatured: true,
      status: "Available",
    },
    {
      title: "Compact 2 Bed near College Gate Mosque",
      propertyType: "Family",
      area: "College Gate",
      addressDetails: "Behind College Gate Jame Masjid, Road 7",
      rentAmount: 12500,
      serviceCharge: 1000,
      advanceMonths: 2,
      bedrooms: 2,
      bathrooms: 1,
      balconies: 1,
      floorNumber: "3",
      facilities: ["Line Gas", "CCTV"],
      houseRules: ["Quiet after Maghrib preferred"],
      images: [IMG.living, IMG.kitchen, IMG.bedroom],
      location: point(90.401, 23.893),
      status: "Rented",
    },
    {
      title: "Pending New Build Flat — Station Road (Under Review)",
      propertyType: "Family",
      area: "Station Road",
      addressDetails: "New 8-storied building, Station Road east side",
      rentAmount: 20000,
      serviceCharge: 2000,
      advanceMonths: 2,
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      floorNumber: "7",
      facilities: ["Lift", "Generator", "Parking", "Prepaid Gas"],
      houseRules: ["To be confirmed after handover"],
      images: [IMG.exterior, IMG.corridor, IMG.living],
      location: point(90.4095, 23.8964),
      status: "Pending",
    },
  ];

  const created = [];
  for (const item of listings) {
    const doc = await Property.create({
      ...item,
      landlord: landlord._id,
      availableFrom: new Date("2026-11-01"),
      videoUrl: "",
    });
    created.push(doc);
  }

  await Review.create([
    {
      property: created[0]._id,
      user: tenant._id,
      rating: 5,
      comment: "College Gate-এর কাছে খুব সুবিধাজনক। বাসা পরিষ্কার, লিফট ও জেনারেটর আছে।",
    },
    {
      property: created[1]._id,
      user: tenant._id,
      rating: 4,
      comment: "IUT-এর কাছাকাছি, মেয়েদের জন্য নিরাপদ এলাকা। ওয়াইফাই স্পিড ভালো।",
    },
    {
      property: created[2]._id,
      user: tenant._id,
      rating: 5,
      comment: "গাজীপুরায় লাইন গ্যাস পাওয়া দুর্লভ — এই ফ্ল্যাটে আছে। Recommended.",
    },
  ]);

  tenant.savedProperties = [created[0]._id, created[4]._id];
  await tenant.save();

  await Ticket.create({
    name: "Farhan Ahmed",
    email: "farhan@example.com",
    subject: "How do I verify my NID as a landlord?",
    message: "I want the verified badge on my Gazipura listing. What documents do you need?",
    status: "Open",
  });

  console.log("[seed] Done.");
  console.log("  Admin    admin@tongirental.bd / Password123!");
  console.log("  Landlord landlord@tongirental.bd / Password123!");
  console.log("  Tenant   tenant@tongirental.bd / Password123!");
  console.log(`  Properties: ${created.length}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
