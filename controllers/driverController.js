const getDrivers = (req, res) => {
  const drivers = global.inMemoryDb.drivers;
  res.status(200).json({ drivers });
};

const rateDriver = (req, res) => {
  const { driverId, rating, feedback } = req.body;
  res.status(200).json({
    message: "Thank you! Rating submitted successfully.",
    rating,
    feedback
  });
};

module.exports = {
  getDrivers,
  rateDriver
};
