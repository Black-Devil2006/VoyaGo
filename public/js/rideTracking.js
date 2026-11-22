// ===================================================
// VoyaGo Live Animated Rider Tracking — Uber / Rapido Engine
// ===================================================

let trackingMap, driverMarker, animationTimer;
let currentRouteCoords = [];
let stepIndex = 0;
let progressVal = 10;

document.addEventListener("DOMContentLoaded", async () => {
  await initTrackingMap();
  startDriverAnimation();
  startEtaCountdown();
});

async function initTrackingMap() {
  const container = document.getElementById("trackingMap");
  if (!container || typeof L === "undefined") return;

  // Retrieve booked ride details from sessionStorage
  let ride = null;
  try {
    const stored = sessionStorage.getItem("voyago_current_ride");
    if (stored) ride = JSON.parse(stored);
  } catch (e) {}

  const defaultPickup = (ride && ride.pickupCoords) ? ride.pickupCoords : [19.0596, 72.8295];
  const defaultDest = (ride && ride.destCoords) ? ride.destCoords : [18.9438, 72.8234];
  const vehicleType = (ride && ride.vehicleType) ? ride.vehicleType : "Rapido Moto";
  const fare = (ride && ride.fare) ? ride.fare : 49;
  const otp = (ride && ride.otp) ? ride.otp : "4821";

  // Update UI card badges
  const fareEl = document.getElementById("tripFare");
  if (fareEl) fareEl.textContent = fare;

  const vehicleEl = document.getElementById("driverVehicle");
  if (vehicleEl) {
    if (vehicleType.includes("Moto") || vehicleType.includes("Bike")) {
      vehicleEl.textContent = `Rapido Captain • Honda Activa (MH-02-AB-1234)`;
      vehicleEl.className = "badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold";
    } else if (vehicleType.includes("Auto")) {
      vehicleEl.textContent = `Auto Rickshaw • MH-02-CD-5678`;
      vehicleEl.className = "badge bg-success rounded-pill px-3 py-2";
    } else {
      vehicleEl.textContent = `UberGo Sedan • Swift Dzire (MH-02-XY-9012)`;
      vehicleEl.className = "badge bg-dark border border-secondary rounded-pill px-3 py-2";
    }
  }

  // Display Safety OTP Badge in UI
  const rideIdBadge = document.getElementById("rideIdBadge");
  if (rideIdBadge) {
    rideIdBadge.innerHTML = `<span class="badge bg-dark border border-success text-success px-2 py-1 fs-6">PIN: <strong>${otp}</strong></span>`;
  }

  // 1. Initialize Map
  trackingMap = L.map("trackingMap", { zoomControl: false }).setView(defaultPickup, 13);

  // Esri World Street Map (Clean, Free, No Watermark)
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles &copy; Esri &mdash; StreetMap',
    maxZoom: 19
  }).addTo(trackingMap);

  L.control.zoom({ position: "bottomright" }).addTo(trackingMap);

  // 2. Fetch Real OSRM Road Route
  const routeData = await VoyaGoMap.getRoadRoute(defaultPickup[0], defaultPickup[1], defaultDest[0], defaultDest[1]);
  currentRouteCoords = routeData.coords;

  // 3. Draw Uber/Rapido Double Polyline
  const poly = VoyaGoMap.drawUberRoute(trackingMap, currentRouteCoords);
  trackingMap.fitBounds(poly.core.getBounds(), { padding: [60, 60] });

  // 4. Pickup & Drop Pins
  const pickupIcon = VoyaGoMap.createUberPickupPin("Your Pickup");
  const dropIcon = VoyaGoMap.createUberDropPin("Destination");

  L.marker(defaultPickup, { icon: pickupIcon }).addTo(trackingMap);
  L.marker(defaultDest, { icon: dropIcon }).addTo(trackingMap);

  // 5. Spawn Moving Driver Vehicle
  const vehicleIcon = VoyaGoMap.createVehicleIcon(vehicleType);
  driverMarker = L.marker(currentRouteCoords[0], {
    icon: vehicleIcon,
    zIndexOffset: 1000
  }).addTo(trackingMap);

  driverMarker.bindPopup(`
    <div style="font-family:inherit; min-width:140px;">
      <strong>Rajesh Kumar</strong><br>
      <small class="text-success">⭐ 4.9 • ${vehicleType}</small><br>
      <small class="text-secondary">En-route to pickup point</small>
    </div>
  `).openPopup();
}

/**
 * Animate the driver smoothly turning and driving along each road point
 */
function startDriverAnimation() {
  if (!currentRouteCoords || currentRouteCoords.length === 0) return;

  const totalSteps = currentRouteCoords.length;
  const statusElem = document.getElementById("rideStatusText");
  const pBar = document.getElementById("rideProgressBar");

  animationTimer = setInterval(() => {
    if (stepIndex < totalSteps - 1) {
      stepIndex++;
      const currentPos = currentRouteCoords[stepIndex];
      const prevPos = currentRouteCoords[stepIndex - 1];

      // Update position
      driverMarker.setLatLng(currentPos);

      // Pan map smoothly to follow vehicle
      if (stepIndex % 3 === 0) {
        trackingMap.panTo(currentPos, { animate: true, duration: 1.0 });
      }

      // Progress percentage
      progressVal = Math.min(100, Math.round((stepIndex / (totalSteps - 1)) * 100));
      if (pBar) pBar.style.width = `${progressVal}%`;

      // Status updates
      if (statusElem) {
        if (progressVal < 25) {
          statusElem.textContent = "Driver is on the way to pickup...";
        } else if (progressVal < 50) {
          statusElem.textContent = "Driver is nearby your pickup location...";
        } else if (progressVal < 75) {
          statusElem.textContent = "Trip in progress • Navigating traffic...";
        } else if (progressVal < 95) {
          statusElem.textContent = "Approaching destination...";
        } else {
          statusElem.textContent = "Arrived at Destination! 🏁";
          clearInterval(animationTimer);
        }
      }
    }
  }, 1800);
}

function startEtaCountdown() {
  let etaMins = 8;
  const etaElem = document.getElementById("etaCountdown");

  const etaTimer = setInterval(() => {
    if (etaMins > 1) {
      etaMins--;
      if (etaElem) etaElem.textContent = `${etaMins} mins`;
    } else {
      clearInterval(etaTimer);
      if (etaElem) etaElem.textContent = "Arrived!";
    }
  }, 4000);
}

function completeCurrentRide() {
  VoyaGo.showToast("Trip ended successfully! Generating invoice...");
  clearInterval(animationTimer);
  setTimeout(() => {
    window.location.href = "/pages/rating.html";
  }, 1000);
}
