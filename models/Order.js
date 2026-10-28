const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: "VoyaPay Wallet" },
  deliveryAddress: { type: String, required: true },
  status: { type: String, enum: ["Processing", "Dispatched", "Delivered"], default: "Processing" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
