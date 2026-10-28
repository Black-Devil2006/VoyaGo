// ===================================================
// VoyaGo Live Animated Driver Tracking — Enhanced
// ===================================================

let trackingMap, driverMarker, animationTimer;
let stepIndex = 0;
let progressVal = 20;

// Mumbai route: Bandra → Mahim → Dadar → Worli → Marine Drive
const routePoints = [
  [19.0596, 72.8295],
  [19.0440, 72.8320],
  [19.0300, 72.8260],
  [19.0150, 72.8250],
  [18.9900, 72.8240],
  [18.9750, 72.8235],
  [18.9600, 72.8234],
  [18.9500, 72.8234],
  [18.9438, 72.8234]
];

const statusMessages = [
  "Driver is on the way...",
  "Driver nearby your area...",
  "Driver is 3 mins away...",
  "Driver is 2 mins away...",
  "Driver has arrived! 🚗",
  "In Transit...",
  "Halfway there!",
  "Almost at destination...",
  "Arrived at Destination! 🏁"
];

document.addEventListener("DOMContentLoaded", () => {
  initTrackingMap();
  startDriverAnimation();
  startEtaCountdown();
});

function initTrackingMap() {
  const container = document.getElementById("trackingMap");
  if (!container) return;

  trackingMap = L.map("trackingMap", { zoomControl: true }).setView(routePoints[0], 13);

  // CartoDB Voyager tiles — beautiful, free
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: "abcd"
  }).addTo(trackingMap);

  // Animated dashed route polyline
  L.polyline(routePoints, {
    color: "#00b894",
    weight: 6,
    opacity: 0.85,
    dashArray: "10 6",
    lineJoin: "round"
  }).addTo(trackingMap);

  // Destination marker (pulsing red dot)
  const destIcon = L.divIcon({
    html: `<div style="position:relative;">
      <div style="background:#fd79a8;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px #fd79a8,0 2px 12px rgba(253,121,168,0.6);"></div>
      <div style="position:absolute;top:-8px;left:-8px;width:36px;height:36px;border-radius:50%;background:rgba(253,121,168,0.2);animation:pulse 1.5s ease-in-out infinite;"></div>
    </div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], className: ""
  });

  L.marker(routePoints[routePoints.length - 1], { icon: destIcon })
    .addTo(trackingMap)
    .bindPopup("<b>🏁 Destination: Marine Drive, Mumbai</b>");

  // Pickup marker
  const pickupIcon = L.divIcon({
    html: `<div style="background:#00b894;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 3px #00b894;"></div>`,
    iconSize: [22, 22], iconAnchor: [11, 11], className: ""
  });

  L.marker(routePoints[0], { icon: pickupIcon })
    .addTo(trackingMap)
    .bindPopup("<b>📍 Pickup: Bandra West, Mumbai</b>");

  // Driver car marker
  const carIcon = L.divIcon({
    html: `<div style="background:linear-gradient(135deg,#00b894,#6c5ce7);width:38px;height:38px;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 16px rgba(0,184,148,0.6);display:flex;align-items:center;justify-content:center;font-size:18px;">🚗</div>`,
    iconSize: [38, 38], iconAnchor: [19, 19], className: ""
  });

  driverMarker = L.marker(routePoints[0], { icon: carIcon })
    .addTo(trackingMap)
    .bindPopup("<b>Rajesh Kumar</b><br>⭐ 4.9 • On the way to pickup!")
    .openPopup();

  trackingMap.fitBounds(L.polyline(routePoints).getBounds(), { padding: [60, 60] });
}

function startDriverAnimation() {
  animationTimer = setInterval(() => {
    if (stepIndex < routePoints.length - 1) {
      stepIndex++;
      const nextPos = routePoints[stepIndex];
      driverMarker.setLatLng(nextPos);
      trackingMap.panTo(nextPos, { animate: true, duration: 1.0 });

      progressVal = Math.min(100, 20 + Math.round((stepIndex / (routePoints.length - 1)) * 80));

      const pBar = document.getElementById("rideProgressBar");
      const statusElem = document.getElementById("rideStatusText");

      if (pBar) pBar.style.width = `${progressVal}%`;
      if (statusElem) statusElem.textContent = statusMessages[stepIndex] || statusMessages[statusMessages.length - 1];

      if (progressVal >= 100) {
        clearInterval(animationTimer);
        const btn = document.querySelector(".btn-voyago[onclick='completeCurrentRide()']");
        if (btn) {
          btn.style.animation = "pulse 0.8s ease-in-out 3";
        }
      }
    }
  }, 3500);
}

function startEtaCountdown() {
  let eta = 5 + routePoints.length;
  const etaElem = document.getElementById("etaCountdown");
  const etaTimer = setInterval(() => {
    if (eta > 1) {
      eta--;
      if (etaElem) etaElem.textContent = `${eta} mins`;
    } else {
      clearInterval(etaTimer);
      if (etaElem) etaElem.textContent = "Arrived!";
    }
  }, 3500);
}

function completeCurrentRide() {
  VoyaGo.showToast("Ride completed! Redirecting to rating...");
  clearInterval(animationTimer);
  setTimeout(() => {
    window.location.href = "/pages/rating.html";
  }, 1000);
}

// CSS pulse animation injection
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.3); opacity: 0; }
    100% { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(style);