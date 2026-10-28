const express = require("express");
const router = express.Router();
const { getVehicles, bookRental, getUserRentals } = require("../controllers/rentalController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/vehicles", getVehicles);
router.post("/book", authMiddleware, bookRental);
router.get("/my-rentals", authMiddleware, getUserRentals);

module.exports = router;
