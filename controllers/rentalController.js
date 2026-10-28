const Rental = require("../models/Rental");

const availableVehicles = [
  { id: "v1", name: "Royal Enfield Hunter 350", type: "Bike", category: "Cruiser", dailyRate: 799, rating: 4.8, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500" },
  { id: "v2", name: "KTM Duke 390", type: "Bike", category: "Sports", dailyRate: 1199, rating: 4.9, image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500" },
  { id: "v3", name: "Ather 450X Electric", type: "Bike", category: "Electric", dailyRate: 499, rating: 4.7, image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=500" },
  { id: "v4", name: "Mahindra Thar 4x4", type: "Car", category: "SUV", dailyRate: 3499, rating: 4.95, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500" },
  { id: "v5", name: "Hyundai Creta 2024", type: "Car", category: "SUV", dailyRate: 2499, rating: 4.8, image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500" },
  { id: "v6", name: "Tata Nexon EV", type: "Car", category: "Electric", dailyRate: 2199, rating: 4.85, image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500" }
];

const getVehicles = (req, res) => {
  const { type } = req.query;
  if (type) {
    const filtered = availableVehicles.filter(v => v.type.toLowerCase() === type.toLowerCase());
    return res.status(200).json({ vehicles: filtered });
  }
  res.status(200).json({ vehicles: availableVehicles });
};

const bookRental = async (req, res) => {
  try {
    const { vehicleName, vehicleType, dailyRate, days, pickupDate, returnDate } = req.body;
    const userId = req.user ? req.user.id : "usr_demo";
    const totalCost = Number(dailyRate) * Number(days);

    const rentalObj = {
      _id: "rent_" + Date.now(),
      userId,
      vehicleName,
      vehicleType,
      dailyRate: Number(dailyRate),
      days: Number(days),
      totalCost,
      pickupDate: pickupDate || new Date().toISOString().split("T")[0],
      returnDate: returnDate || new Date(Date.now() + 86400000 * (days || 1)).toISOString().split("T")[0],
      status: "Confirmed",
      createdAt: new Date()
    };

    try {
      const rental = await Rental.create(rentalObj);
      return res.status(201).json({ message: "Vehicle Rental Confirmed!", rental });
    } catch (e) {
      global.inMemoryDb.rentals.unshift(rentalObj);
      return res.status(201).json({ message: "Vehicle Rental Confirmed!", rental: rentalObj });
    }
  } catch (error) {
    res.status(500).json({ message: "Rental booking failed" });
  }
};

const getUserRentals = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : "usr_demo";
    let rentals = [];
    try {
      rentals = await Rental.find({ userId }).sort({ createdAt: -1 });
    } catch (e) {
      rentals = (global.inMemoryDb.rentals || []).filter(r => String(r.userId) === String(userId));
    }

    if (!rentals || rentals.length === 0) {
      rentals = [
        {
          _id: "rent_1",
          vehicleName: "Royal Enfield Hunter 350",
          vehicleType: "Bike",
          dailyRate: 799,
          days: 2,
          totalCost: 1598,
          pickupDate: "2026-09-20",
          returnDate: "2026-09-22",
          status: "Returned"
        }
      ];
    }

    res.status(200).json({ rentals });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rental history" });
  }
};

module.exports = {
  getVehicles,
  bookRental,
  getUserRentals
};
