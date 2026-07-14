const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const helmet = require("helmet");
const compression = require("compression");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use("/api/auth", authRoutes);

app.use(express.static("public"));
app.get("/", (req, res) => {
    res.send("🚀 VoyaGo Backend is Running Successfully!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});