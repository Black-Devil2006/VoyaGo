const express = require("express");
const router = express.Router();
const { getProducts, placeOrder, getUserOrders } = require("../controllers/groceryController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/products", getProducts);
router.post("/order", authMiddleware, placeOrder);
router.get("/my-orders", authMiddleware, getUserOrders);

module.exports = router;
