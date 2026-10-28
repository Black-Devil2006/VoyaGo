const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: "Rider" },
  pickupLocation: { type: String, required: true },
  destinationLocation: { type: String, required: true },
  vehicleType: { type: String, required: true, enum: ["Moto", "Auto", "Sedan", "SUV", "Premium"] },
  fare: { type: Number, required: true },
  distance: { type: String, default: "5.2 km" },
  duration: { type: String, default: "15 mins" },
  status: { type: String, enum: ["Requested", "Accepted", "In Transit", "Completed", "Cancelled"], default: "Requested" },
  driver: {
    name: { type: String, default: "Rajesh Kumar" },
    phone: { type: String, default: "+91 9876543210" },
    rating: { type: Number, default: 4.9 },
    vehicleNumber: { type: String, default: "MH-02-AB-1234" }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Ride || mongoose.model("Ride", rideSchema);
