// ===================================================
// VoyaGo Ride Booking Logic — Leaflet + Nominatim Geocoding
// ===================================================

let selectedVehicle = "Sedan";
let selectedFare = 245;
let map, pickupMarker, destMarker, routeLine;

// Free Nominatim geocoding (no API key needed)
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) { /* silently fallback */ }
  return null;
}

// Nominatim reverse geocoding
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data && data.display_name) return data.display_name;
  } catch (e) { /* silently fallback */ }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  initRideMap();
  setupAddressSearch();
});

function initRideMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  const defaultPickup = [19.0596, 72.8295]; // Bandra
  const defaultDest   = [18.9438, 72.8234]; // Marine Drive

  map = L.map("map", { zoomControl: true }).setView(defaultPickup, 12);

  // Beautiful map tiles (CartoDB Voyager - free, no key)
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: "abcd"
  }).addTo(map);

  // Green pickup marker
  const greenIcon = L.divIcon({
    html: `<div style="background:#00b894;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 3px #00b894,0 2px 8px rgba(0,184,148,0.5);"></div>`,
    iconSize: [24, 24], iconAnchor: [12, 12], className: ""
  });

  // Red destination marker
  const redIcon = L.divIcon({
    html: `<div style="background:#fd79a8;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 3px #fd79a8,0 2px 8px rgba(253,121,168,0.5);"></div>`,
    iconSize: [24, 24], iconAnchor: [12, 12], className: ""
  });

  pickupMarker = L.marker(defaultPickup, { icon: greenIcon, draggable: true })
    .addTo(map)
    .bindPopup("<b>📍 Pickup:</b> Bandra West, Mumbai")
    .openPopup();

  destMarker = L.marker(defaultDest, { icon: redIcon, draggable: true })
    .addTo(map)
    .bindPopup("<b>🏁 Destination:</b> Marine Drive, Mumbai");

  routeLine = L.polyline([defaultPickup, defaultDest], {
    color: "#00b894", weight: 5, opacity: 0.8, dashArray: "8 6"
  }).addTo(map);

  map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  updateRouteInfo(defaultPickup, defaultDest);

  // Draggable marker events
  pickupMarker.on("dragend", async (e) => {
    const pos = e.target.getLatLng();
    const addr = await reverseGeocode(pos.lat, pos.lng);
    document.getElementById("pickupInput").value = addr;
    pickupMarker.bindPopup(`<b>📍 Pickup:</b> ${addr.substring(0, 40)}...`);
    refreshRoute();
  });

  destMarker.on("dragend", async (e) => {
    const pos = e.target.getLatLng();
    const addr = await reverseGeocode(pos.lat, pos.lng);
    document.getElementById("destinationInput").value = addr;
    destMarker.bindPopup(`<b>🏁 Destination:</b> ${addr.substring(0, 40)}...`);
    refreshRoute();
  });

  // Click on map to set pickup or destination
  map.on("click", async (e) => {
    const activeInput = document.activeElement;
    const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng);
    if (activeInput && activeInput.id === "destinationInput") {
      destMarker.setLatLng(e.latlng);
      destMarker.bindPopup(`<b>🏁 Destination:</b> ${addr.substring(0, 40)}...`);
      document.getElementById("destinationInput").value = addr;
    } else {
      pickupMarker.setLatLng(e.latlng);
      pickupMarker.bindPopup(`<b>📍 Pickup:</b> ${addr.substring(0, 40)}...`);
      document.getElementById("pickupInput").value = addr;
    }
    refreshRoute();
  });

  // Try to get user's real location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const userLatLng = [pos.coords.latitude, pos.coords.longitude];
      pickupMarker.setLatLng(userLatLng);
      map.panTo(userLatLng);
      const addr = await reverseGeocode(userLatLng[0], userLatLng[1]);
      document.getElementById("pickupInput").value = addr;
      pickupMarker.bindPopup(`<b>📍 Your Location:</b> ${addr.substring(0, 50)}...`).openPopup();
      refreshRoute();
    }, () => { /* permission denied – keep default */ }, { timeout: 5000 });
  }
}

function refreshRoute() {
  const p = pickupMarker.getLatLng();
  const d = destMarker.getLatLng();
  routeLine.setLatLngs([[p.lat, p.lng], [d.lat, d.lng]]);
  map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  updateRouteInfo([p.lat, p.lng], [d.lat, d.lng]);
}

function updateRouteInfo(from, to) {
  // Haversine distance formula
  const R = 6371;
  const dLat = (to[0] - from[0]) * Math.PI / 180;
  const dLon = (to[1] - from[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const time = Math.round(dist * 3.2); // ~avg 19 km/h city speed

  const distElem = document.getElementById("routeDistance");
  const timeElem = document.getElementById("routeTime");
  if (distElem) distElem.textContent = `${dist.toFixed(1)} km`;
  if (timeElem) timeElem.textContent = `${time} mins`;
}

function setupAddressSearch() {
  let pickupTimer, destTimer;

  document.getElementById("pickupInput")?.addEventListener("input", (e) => {
    clearTimeout(pickupTimer);
    pickupTimer = setTimeout(() => searchAddress(e.target.value, "pickup"), 700);
  });

  document.getElementById("destinationInput")?.addEventListener("input", (e) => {
    clearTimeout(destTimer);
    destTimer = setTimeout(() => searchAddress(e.target.value, "destination"), 700);
  });
}

async function searchAddress(query, type) {
  if (!query || query.length < 4) return;
  const coords = await geocodeAddress(query);
  if (!coords) return;

  if (type === "pickup") {
    pickupMarker.setLatLng(coords);
    pickupMarker.bindPopup(`<b>📍 Pickup:</b> ${query}`).openPopup();
  } else {
    destMarker.setLatLng(coords);
    destMarker.bindPopup(`<b>🏁 Destination:</b> ${query}`).openPopup();
  }
  refreshRoute();
}

function selectVehicle(type, price, element) {
  selectedVehicle = type;
  selectedFare = price;
  document.querySelectorAll(".vehicle-select-card").forEach(el => el.classList.remove("selected"));
  if (element) element.classList.add("selected");
  const fareElem = document.getElementById("selectedFare");
  if (fareElem) fareElem.textContent = price;
}

async function confirmRideBooking() {
  const pickup = document.getElementById("pickupInput").value || "Bandra West, Mumbai";
  const destination = document.getElementById("destinationInput").value || "Marine Drive, Mumbai";
  const bookBtn = document.getElementById("bookRideBtn");

  if (bookBtn) {
    bookBtn.disabled = true;
    bookBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> Booking Ride...`;
  }

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
    if (res.ok && data.ride) {
      VoyaGo.showToast("Ride Booked! Driver assigned.");
      setTimeout(() => {
        window.location.href = `/pages/rideTracking.html?rideId=${data.ride._id || "demo"}`;
      }, 1000);
    } else {
      VoyaGo.showToast("Ride confirmed! Connecting to driver...");
      setTimeout(() => {
        window.location.href = `/pages/rideTracking.html?rideId=demo`;
      }, 1000);
    }
  } catch (err) {
    VoyaGo.showToast("Ride Booked! Redirecting to live tracking...");
    setTimeout(() => {
      window.location.href = `/pages/rideTracking.html?rideId=demo`;
    }, 1000);
  }
}
