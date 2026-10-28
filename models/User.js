const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "+91 9876543210" },
  role: { type: String, enum: ["user", "driver", "admin"], default: "user" },
  avatar: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400" },
  walletBalance: { type: Number, default: 2500 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);