const path = require("path");
const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/database");
const helmet = require("helmet");
const compression = require("compression");

const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const groceryRoutes = require("./routes/groceryRoutes");
const driverRoutes = require("./routes/driverRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
// Configure helmet with relaxed CSP for CDN scripts (Leaflet, Bootstrap, FontAwesome, Google Fonts)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/driver", driverRoutes);

// Health Check API
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date(), app: "VoyaGo Platform" });
});

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// Default route -> serve landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "index.html"));
});

// Fallback for pages
app.get("/pages/:page", (req, res) => {
  const pagePath = path.join(__dirname, "public", "pages", req.params.page);
  res.sendFile(pagePath, (err) => {
    if (err) {
      res.redirect("/");
    }
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 VoyaGo Server running smoothly on port ${PORT}`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
  });
}

module.exports = app;