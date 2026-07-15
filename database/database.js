const mongoose = require("mongoose");
const dns = require("dns").promises;

const connectDB = async () => {
  try {
    // Check if DNS resolution for MongoDB SRV fails, and use public DNS fallback if needed
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith("mongodb+srv://")) {
      const url = new URL(process.env.MONGODB_URI);
      try {
        await dns.resolveSrv(`_mongodb._tcp.${url.hostname}`);
      } catch (dnsErr) {
        console.warn("⚠️  Local DNS failed to resolve MongoDB SRV records. Falling back to public DNS (8.8.8.8)...");
        const dnsSync = require("dns");
        dnsSync.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
      }
    }
  } catch (dnsCheckErr) {
    console.warn("⚠️  Could not run DNS pre-check:", dnsCheckErr.message);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });

    console.log("MongoDB Connected Successfully!");
    console.log(`Host: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;