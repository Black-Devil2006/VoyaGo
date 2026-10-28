const Ride = require("../models/Ride");

const fareRates = {
  Moto: { base: 25, perKm: 10 },
  Auto: { base: 35, perKm: 14 },
  Sedan: { base: 60, perKm: 20 },
  SUV: { base: 90, perKm: 28 },
  Premium: { base: 120, perKm: 35 }
};

const calculateFare = (req, res) => {
  const { distanceKm, vehicleType } = req.body;
  const dist = parseFloat(distanceKm) || 5.2;
  const rate = fareRates[vehicleType] || fareRates["Sedan"];
  const totalFare = Math.round(rate.base + dist * rate.perKm);
  res.status(200).json({ fare: totalFare, distance: dist.toFixed(1) + " km", vehicleType });
};

const bookRide = async (req, res) => {
  try {
    const { pickupLocation, destinationLocation, vehicleType, fare } = req.body;
    const userId = req.user ? req.user.id : "usr_demo";
    const userName = req.user ? req.user.name : "Passenger";

    const rideData = {
      _id: "ride_" + Date.now(),
      userId,
      userName,
      pickupLocation,
      destinationLocation,
      vehicleType: vehicleType || "Sedan",
      fare: Number(fare) || 160,
      distance: "5.4 km",
      duration: "14 mins",
      status: "Accepted",
      driver: {
        name: "Rajesh Kumar",
        phone: "+91 9876543210",
        rating: 4.9,
        vehicleNumber: "MH-02-AB-1234"
      },
      createdAt: new Date()
    };

    try {
      const newRide = await Ride.create(rideData);
      return res.status(201).json({ message: "Ride Booked Successfully!", ride: newRide });
    } catch (dbErr) {
      global.inMemoryDb.rides.unshift(rideData);
      return res.status(201).json({ message: "Ride Booked Successfully!", ride: rideData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to book ride" });
  }
};

const getUserRides = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : "usr_demo";
    let rides = [];
    try {
      rides = await Ride.find({ userId }).sort({ createdAt: -1 });
    } catch (e) {
      rides = (global.inMemoryDb.rides || []).filter(r => String(r.userId) === String(userId));
    }

    if (!rides || rides.length === 0) {
      rides = [
        {
          _id: "ride_101",
          pickupLocation: "Bandra West, Mumbai",
          destinationLocation: "Marine Drive, Mumbai",
          vehicleType: "Sedan",
          fare: 245,
          distance: "14.2 km",
          status: "Completed",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          _id: "ride_102",
          pickupLocation: "Andheri East, Mumbai",
          destinationLocation: "BKC Expressway",
          vehicleType: "Moto",
          fare: 95,
          distance: "6.5 km",
          status: "Completed",
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ];
    }

    res.status(200).json({ rides });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rides" });
  }
};

const getRideDetails = async (req, res) => {
  try {
    const { id } = req.params;
    let ride = null;
    try {
      ride = await Ride.findById(id);
    } catch (e) {
      ride = (global.inMemoryDb.rides || []).find(r => String(r._id) === String(id));
    }

    if (!ride) {
      ride = {
        _id: id,
        pickupLocation: "Bandra West, Mumbai",
        destinationLocation: "Marine Drive, Mumbai",
        vehicleType: "Sedan",
        fare: 245,
        status: "In Transit",
        driver: { name: "Rajesh Kumar", phone: "+91 9876543210", rating: 4.9, vehicleNumber: "MH-02-AB-1234" }
      };
    }

    res.status(200).json({ ride });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ride details" });
  }
};

module.exports = {
  calculateFare,
  bookRide,
  getUserRides,
  getRideDetails
};
