// ===================================================
// VoyaGo Rider App Engine — Real-time Uber / Rapido Experience
// ===================================================

let selectedVehicle = "Rapido Moto";
let baseRatePerKm = {
  "Rapido Moto": 9,
  "VoyaGo Auto": 13,
  "UberGo Sedan": 18,
  "Premier SUV": 26
};
let selectedFare = 49;
let map, pickupMarker, destMarker;
let routeLayers = null;
let nearbyFleet = [];
let currentDistanceKm = 8.5;

document.addEventListener("DOMContentLoaded", () => {
  initRiderMap();
  setupRiderAutocomplete();
});

async function initRiderMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") return;

  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlLat = parseFloat(urlParams.get("lat"));
  const urlLng = parseFloat(urlParams.get("lng"));
  const urlAddr = urlParams.get("addr");

  let defaultPickup = [19.0596, 72.8295]; // Bandra West
  const defaultDest   = [18.9438, 72.8234]; // Marine Drive

  if (!isNaN(urlLat) && !isNaN(urlLng)) {
    defaultPickup = [urlLat, urlLng];
    if (urlAddr) {
      const pInput = document.getElementById("pickupInput");
      if (pInput) pInput.value = decodeURIComponent(urlAddr);
    }
  }

  // 1. Initialize Leaflet Map
  map = L.map("map", { zoomControl: false }).setView(defaultPickup, 13);

  // Esri World Street Map (Clean, 100% Free, No Watermark)
  const streetLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles &copy; Esri &mdash; StreetMap',
    maxZoom: 19
  }).addTo(map);

  const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles &copy; Esri &mdash; Satellite',
    maxZoom: 18
  });

  const hotLayer = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    subdomains: "abc"
  });

  L.control.layers({
    "🗺️ Streets": streetLayer,
    "📍 Detailed (OSM)": hotLayer,
    "🛰️ Satellite": satelliteLayer
  }, null, { position: "topright" }).addTo(map);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  // 2. Add Uber/Rapido Styled Pins
  const pickupIcon = VoyaGoMap.createUberPickupPin("Pickup Point");
  const dropIcon = VoyaGoMap.createUberDropPin("Destination");

  pickupMarker = L.marker(defaultPickup, { icon: pickupIcon, draggable: true }).addTo(map);
  destMarker = L.marker(defaultDest, { icon: dropIcon, draggable: true }).addTo(map);

  // Draggable marker handlers
  pickupMarker.on("dragend", async (e) => {
    const pos = e.target.getLatLng();
    const addr = await VoyaGoMap.reverseGeocode(pos.lat, pos.lng);
    document.getElementById("pickupInput").value = addr;
    updateRoadRoute();
  });

  destMarker.on("dragend", async (e) => {
    const pos = e.target.getLatLng();
    const addr = await VoyaGoMap.reverseGeocode(pos.lat, pos.lng);
    document.getElementById("destinationInput").value = addr;
    updateRoadRoute();
  });

  // Map Click to Set Location
  map.on("click", async (e) => {
    const active = document.activeElement;
    const addr = await VoyaGoMap.reverseGeocode(e.latlng.lat, e.latlng.lng);
    if (active && active.id === "destinationInput") {
      destMarker.setLatLng(e.latlng);
      document.getElementById("destinationInput").value = addr;
    } else {
      pickupMarker.setLatLng(e.latlng);
      document.getElementById("pickupInput").value = addr;
    }
    updateRoadRoute();
  });

  // 3. Compute Real Turn-By-Turn Road Route (OSRM)
  await updateRoadRoute();

  // 4. Spawn Real-time Roaming Rapido Bikes & Cabs on streets
  nearbyFleet = VoyaGoMap.spawnNearbyDrivers(map, defaultPickup[0], defaultPickup[1], 5);

  // 5. Try GPS Auto-detect if no URL coordinate
  if (isNaN(urlLat) && window.VoyaGoMap) {
    VoyaGoMap.getUserLocation().then((loc) => {
      if (loc && loc.source !== "default") {
        pickupMarker.setLatLng([loc.lat, loc.lng]);
        const pIn = document.getElementById("pickupInput");
        if (pIn) pIn.value = loc.address;
        updateRoadRoute();
      }
    }).catch(() => {});
  }
}

/**
 * Fetch and draw real road navigation polyline via OSRM
 */
async function updateRoadRoute() {
  if (!pickupMarker || !destMarker) return;
  const p = pickupMarker.getLatLng();
  const d = destMarker.getLatLng();

  // Remove existing route layers
  if (routeLayers) {
    map.removeLayer(routeLayers.casing);
    map.removeLayer(routeLayers.core);
    routeLayers = null;
  }

  // Fetch real road route geometry from OSRM
  const routeData = await VoyaGoMap.getRoadRoute(p.lat, p.lng, d.lat, d.lng);
  currentDistanceKm = parseFloat(routeData.distanceKm) || 10;

  // Draw double-layered road line (Uber style)
  routeLayers = VoyaGoMap.drawUberRoute(map, routeData.coords);

  // Fit map viewport smoothly to the route
  map.fitBounds(routeLayers.core.getBounds(), {
    padding: [60, 60],
    maxZoom: 15
  });

  // Update floating info banner
  const distEl = document.getElementById("routeDistance");
  const timeEl = document.getElementById("routeTime");
  if (distEl) distEl.textContent = `${routeData.distanceKm} km`;
  if (timeEl) timeEl.textContent = `${routeData.durationMins} mins`;

  // Recalculate dynamic fares for all vehicles
  recalculateAllFares();
}

/**
 * Update fares based on actual road distance
 */
function recalculateAllFares() {
  const km = Math.max(1.5, currentDistanceKm);
  const fares = {
    "Rapido Moto": Math.round(25 + km * baseRatePerKm["Rapido Moto"]),
    "VoyaGo Auto": Math.round(35 + km * baseRatePerKm["VoyaGo Auto"]),
    "UberGo Sedan": Math.round(70 + km * baseRatePerKm["UberGo Sedan"]),
    "Premier SUV": Math.round(110 + km * baseRatePerKm["Premier SUV"])
  };

  document.querySelectorAll(".ride-card").forEach((card) => {
    const nameEl = card.querySelector("strong");
    if (!nameEl) return;
    const name = nameEl.textContent.trim();
    if (fares[name]) {
      const valEl = card.querySelector(".fare-val");
      if (valEl) valEl.textContent = fares[name];
    }
  });

  selectedFare = fares[selectedVehicle] || 49;
  const fareEl = document.getElementById("selectedFare");
  if (fareEl) fareEl.textContent = selectedFare;
}

/**
 * Rider clicks a ride option (Rapido Moto, Auto, Sedan, SUV)
 */
function selectVehicle(type, defaultBasePrice, element) {
  selectedVehicle = type;
  document.querySelectorAll(".ride-card").forEach((c) => c.classList.remove("selected"));
  if (element) element.classList.add("selected");

  const nameEl = document.getElementById("btnRideName");
  if (nameEl) nameEl.textContent = type;

  recalculateAllFares();
}

/**
 * 1-Click Detect GPS Location
 */
async function useCurrentLocationForPickup() {
  if (!window.VoyaGoMap) return;
  if (window.VoyaGo && VoyaGo.showToast) {
    VoyaGo.showToast("Detecting your live location...", "info");
  }

  try {
    const loc = await VoyaGoMap.getUserLocation();
    pickupMarker.setLatLng([loc.lat, loc.lng]);
    map.panTo([loc.lat, loc.lng]);
    const input = document.getElementById("pickupInput");
    if (input) input.value = loc.address;
    await updateRoadRoute();

    if (window.VoyaGo && VoyaGo.showToast) {
      VoyaGo.showToast(`Pickup set to: ${loc.address}`);
    }
  } catch (err) {
    if (window.VoyaGo && VoyaGo.showToast) {
      VoyaGo.showToast("Could not detect location.", "warning");
    }
  }
}

/**
 * Quick destination chips
 */
async function setQuickDestination(address) {
  const input = document.getElementById("destinationInput");
  if (input) input.value = address;

  const results = await VoyaGoMap.searchAddress(address);
  if (results.length > 0) {
    destMarker.setLatLng([results[0].lat, results[0].lng]);
    await updateRoadRoute();
  }
}

/**
 * Setup autocomplete for pickup and drop inputs
 */
function setupRiderAutocomplete() {
  attachSearchListener("pickupInput", "pickupSuggestions", (lat, lng, name) => {
    pickupMarker.setLatLng([lat, lng]);
    updateRoadRoute();
  });

  attachSearchListener("destinationInput", "destSuggestions", (lat, lng, name) => {
    destMarker.setLatLng([lat, lng]);
    updateRoadRoute();
  });
}

function attachSearchListener(inputId, boxId, onSelect) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(boxId);
  if (!input || !box) return;

  let timer;

  input.addEventListener("input", (e) => {
    clearTimeout(timer);
    const query = e.target.value.trim();
    if (query.length < 3) {
      box.style.display = "none";
      box.innerHTML = "";
      return;
    }

    timer = setTimeout(async () => {
      const results = await VoyaGoMap.searchAddress(query);
      if (results.length === 0) {
        box.style.display = "none";
        return;
      }

      box.innerHTML = results
        .map(
          (item) => `
            <div class="map-suggestion-item" onclick="handleSelectSuggestion('${inputId}', '${boxId}', ${item.lat}, ${item.lng}, '${item.name.replace(/'/g, "\\'")}')">
              <i class="fa-solid fa-location-dot me-2 text-success"></i>
              <strong>${item.shortName}</strong>
              <div class="small text-secondary text-truncate">${item.name}</div>
            </div>
          `
        )
        .join("");
      box.style.display = "block";
    }, 350);
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !box.contains(e.target)) {
      box.style.display = "none";
    }
  });
}

function handleSelectSuggestion(inputId, boxId, lat, lng, name) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(boxId);
  if (input) input.value = name;
  if (box) box.style.display = "none";

  if (inputId === "pickupInput") {
    pickupMarker.setLatLng([lat, lng]);
  } else {
    destMarker.setLatLng([lat, lng]);
  }
  updateRoadRoute();
}

/**
 * Book Ride and Dispatch Driver
 */
async function confirmRideBooking() {
  const pickup = document.getElementById("pickupInput").value || "Bandra West, Mumbai";
  const destination = document.getElementById("destinationInput").value || "Marine Drive, Mumbai";
  const bookBtn = document.getElementById("bookRideBtn");

  if (bookBtn) {
    bookBtn.disabled = true;
    bookBtn.innerHTML = `<i class="fa-solid fa-satellite-dish fa-spin me-2"></i> Contacting Nearby ${selectedVehicle}...`;
  }

  const pPos = pickupMarker.getLatLng();
  const dPos = destMarker.getLatLng();

  // Save ride details to sessionStorage for the tracking screen
  sessionStorage.setItem("voyago_current_ride", JSON.stringify({
    vehicleType: selectedVehicle,
    fare: selectedFare,
    pickup,
    destination,
    pickupCoords: [pPos.lat, pPos.lng],
    destCoords: [dPos.lat, dPos.lng],
    distanceKm: currentDistanceKm,
    otp: Math.floor(1000 + Math.random() * 9000)
  }));

  const token = VoyaGo.getToken();

  try {
    const res = await fetch("/api/rides/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({
        pickupLocation: pickup,
        destinationLocation: destination,
        vehicleType: selectedVehicle,
        fare: selectedFare
      })
    });

    const data = await res.json();
    const rideId = (data.ride && data.ride._id) ? data.ride._id : "vg-" + Date.now();
    VoyaGo.showToast(`Ride Confirmed! Assigned nearest ${selectedVehicle}.`);
    setTimeout(() => {
      window.location.href = `/pages/rideTracking.html?rideId=${rideId}`;
    }, 1000);
  } catch (err) {
    VoyaGo.showToast(`Ride Confirmed! Connecting with ${selectedVehicle}...`);
    setTimeout(() => {
      window.location.href = `/pages/rideTracking.html?rideId=demo`;
    }, 1000);
  }
}
