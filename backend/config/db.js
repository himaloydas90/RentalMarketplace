/**
 * @file db.js
 * @description MongoDB Atlas connection using Mongoose.
 * WHY: One reusable connect function keeps server.js slim and lets seed.js
 * reuse the same Atlas URI, pool, and error handling.
 */

const dns = require("dns");
const mongoose = require("mongoose");
const env = require("./env");

// Many home routers (Windows) refuse SRV lookups required by mongodb+srv://.
// Prefer public resolvers so Atlas discovery still works on those networks.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "192.168.0.1"]);
} catch {
  /* ignore if the runtime forbids overriding resolvers */
}

/**
 * Establish a MongoDB connection with sensible production defaults.
 * @returns {Promise<typeof mongoose>}
 */
async function connectDatabase() {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.dbUrl, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
  });

  console.log(`[db] Connected to MongoDB (${mongoose.connection.name})`);
  return mongoose;
}

module.exports = { connectDatabase };
