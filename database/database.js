const mongoose = require("mongoose");
const dns = require("dns").promises;

// In-Memory Data Store fallback when MongoDB is not reachable
global.inMemoryDb = global.inMemoryDb || {
  users: [],
  rides: [],
  rentals: [],
  orders: [],
  products: [
    { _id: "prod_1", name: "Fresh Apples (1kg)", category: "Fruits & Veggies", price: 180, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", stock: 50, rating: 4.8 },
    { _id: "prod_2", name: "Organic Milk (1L)", category: "Dairy & Bakery", price: 65, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400", stock: 100, rating: 4.9 },
    { _id: "prod_3", name: "Whole Wheat Bread", category: "Dairy & Bakery", price: 45, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", stock: 30, rating: 4.6 },
    { _id: "prod_4", name: "Fresh Bananas (1 Dozen)", category: "Fruits & Veggies", price: 60, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", stock: 40, rating: 4.7 },
    { _id: "prod_5", name: "Dark Roasted Coffee Beans (250g)", category: "Beverages", price: 350, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400", stock: 25, rating: 4.9 },
    { _id: "prod_6", name: "Natural Potato Chips", category: "Snacks", price: 30, image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400", stock: 60, rating: 4.5 },
  ],
  drivers: [
    { _id: "drv_1", name: "Rajesh Kumar", phone: "+91 9876543210", vehicleType: "Sedan", vehicleNumber: "MH-02-AB-1234", rating: 4.9, location: { lat: 19.076, lng: 72.8777 } },
    { _id: "drv_2", name: "Amit Sharma", phone: "+91 9812345678", vehicleType: "SUV", vehicleNumber: "MH-12-CD-5678", rating: 4.8, location: { lat: 19.082, lng: 72.882 } },
    { _id: "drv_3", name: "Vikram Singh", phone: "+91 9988776655", vehicleType: "Moto", vehicleNumber: "MH-04-EF-9012", rating: 4.95, location: { lat: 19.07, lng: 72.87 } },
  ]
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI is not set. Operating with resilient in-memory storage.");
    return;
  }

  try {
    if (process.env.MONGODB_URI.startsWith("mongodb+srv://")) {
      const url = new URL(process.env.MONGODB_URI);
      try {
        await dns.resolveSrv(`_mongodb._tcp.${url.hostname}`);
      } catch (dnsErr) {
        console.warn("⚠️  Local DNS failed to resolve MongoDB SRV. Setting fallback public DNS servers...");
        const dnsSync = require("dns");
        dnsSync.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
      }
    }
  } catch (dnsCheckErr) {
    console.warn("⚠️ DNS pre-check skipped:", dnsCheckErr.message);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    console.log("🟢 MongoDB Connected Successfully!");
    console.log(`📌 Host: ${conn.connection.host}`);
  } catch (err) {
    console.warn("⚠️ MongoDB Connection Warning:", err.message);
    console.warn("🚀 VoyaGo is operating in hybrid mode with local memory fallback to guarantee zero downtime!");
  }
};

module.exports = connectDB;