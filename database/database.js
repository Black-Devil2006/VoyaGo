const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });

    console.log("MongoDB Connected");
    console.log(conn.connection.host);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;