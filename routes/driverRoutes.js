const express = require("express");
const router = express.Router();
const { getDrivers, rateDriver } = require("../controllers/driverController");

router.get("/list", getDrivers);
router.post("/rate", rateDriver);

module.exports = router;
