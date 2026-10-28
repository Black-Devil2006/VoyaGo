const express = require("express");
const router = express.Router();
const { calculateFare, bookRide, getUserRides, getRideDetails } = require("../controllers/rideController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/estimate", calculateFare);
router.post("/book", authMiddleware, bookRide);
router.get("/my-rides", authMiddleware, getUserRides);
router.get("/:id", authMiddleware, getRideDetails);

module.exports = router;
