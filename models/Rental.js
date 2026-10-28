const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vehicleName: { type: String, required: true },
  vehicleType: { type: String, enum: ["Car", "Bike"], required: true },
  vehicleCategory: { type: String, default: "Standard" },
  dailyRate: { type: Number, required: true },
  days: { type: Number, required: true, default: 1 },
  totalCost: { type: Number, required: true },
  pickupDate: { type: String, required: true },
  returnDate: { type: String, required: true },
  status: { type: String, enum: ["Confirmed", "Active", "Returned", "Cancelled"], default: "Confirmed" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Rental || mongoose.model("Rental", rentalSchema);
