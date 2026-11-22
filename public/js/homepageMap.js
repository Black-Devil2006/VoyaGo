// ===================================================
// VoyaGo Homepage Interactive Map Script
// ===================================================

let homepageMapInstance = null;
let userMarker = null;
let activeDrivers = [];

document.addEventListener("DOMContentLoaded", () => {
  initHomepageMap();
});

async function initHomepageMap() {
  const container = document.getElementById("homepageMap");
  if (!container || typeof L === "undefined") return;

  // Initialize map centered at default location first
  homepageMapInstance = VoyaGoMap.createMap("homepageMap", [19.0760, 72.8777], 13);
  if (!homepageMapInstance) return;

  // Attempt to acquire real live user location
  updateLocationStatus("Detecting your live location...", "info");

  try {
    const loc = await VoyaGoMap.getUserLocation();
    setUserPosition(loc.lat, loc.lng, loc.address, loc.source);
  } catch (err) {
    console.warn("Could not retrieve user location:", err);
    setUserPosition(VoyaGoMap.DEFAULT_LOCATION.lat, VoyaGoMap.DEFAULT_LOCATION.lng, VoyaGoMap.DEFAULT_LOCATION.address, "default");
  }

  // Setup address search autocomplete
  setupHomepageSearch();
}

/**
 * Update map to user position and spawn nearby drivers
 */
function setUserPosition(lat, lng, address, source) {
  if (!homepageMapInstance) return;

  // Fly to user coordinates
  homepageMapInstance.flyTo([lat, lng], 14, { duration: 1.5 });

  // Add / update pulsing user marker
  if (userMarker) {
    userMarker.setLatLng([lat, lng]);
  } else {
    userMarker = L.marker([lat, lng], {
      icon: VoyaGoMap.createUserIcon(),
      zIndexOffset: 1000
    }).addTo(homepageMapInstance);
  }

  userMarker.bindPopup(`
    <div style="font-family:inherit; min-width:180px;">
      <div style="font-weight:700; color:#00b894; margin-bottom:4px;">📍 Your Location (${source.toUpperCase()})</div>
      <div style="font-size:13px; color:#334155; line-height:1.4;">${address}</div>
      <div style="margin-top:8px;">
        <a href="/pages/rideBooking.html?lat=${lat}&lng=${lng}&addr=${encodeURIComponent(address)}" class="btn-voyago btn-sm d-inline-block text-white" style="text-decoration:none; padding:4px 10px; font-size:12px; border-radius:6px; background:#00b894;">Book Ride Here</a>
      </div>
    </div>
  `).openPopup();

  // Update UI Stats Badge
  const userAddrEl = document.getElementById("userDetectedAddress");
  const userCoordsEl = document.getElementById("userDetectedCoords");
  if (userAddrEl) userAddrEl.textContent = address;
  if (userCoordsEl) userCoordsEl.textContent = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;

  // Update CTA link
  const bookBtn = document.getElementById("homepageBookBtn");
  if (bookBtn) {
    bookBtn.href = `/pages/rideBooking.html?lat=${lat}&lng=${lng}&addr=${encodeURIComponent(address)}`;
  }

  // Spawn simulated nearby cabs around the user
  if (activeDrivers.length > 0) {
    activeDrivers.forEach(d => homepageMapInstance.removeLayer(d.marker));
  }
  activeDrivers = VoyaGoMap.spawnNearbyDrivers(homepageMapInstance, lat, lng, 4);

  // Update nearby driver counter
  const driverCountEl = document.getElementById("nearbyDriversCount");
  if (driverCountEl) driverCountEl.textContent = `${activeDrivers.length} Cabs Available`;
}

/**
 * Locate Me Button Click Handler
 */
async function locateUserNow() {
  const btn = document.getElementById("locateMeBtn");
  if (btn) {
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating...`;
  }

  try {
    const loc = await VoyaGoMap.getUserLocation();
    setUserPosition(loc.lat, loc.lng, loc.address, loc.source);
    if (window.VoyaGo && VoyaGo.showToast) {
      VoyaGo.showToast(`Location found: ${loc.address}`);
    }
  } catch (err) {
    if (window.VoyaGo && VoyaGo.showToast) {
      VoyaGo.showToast("Could not get location. Using default city center.", "warning");
    }
  } finally {
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Locate Me`;
    }
  }
}

/**
 * Setup address search with Nominatim live suggestions
 */
function setupHomepageSearch() {
  const searchInput = document.getElementById("mapSearchInput");
  const suggestionsBox = document.getElementById("mapSearchSuggestions");
  if (!searchInput || !suggestionsBox) return;

  let debounceTimer;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (query.length < 3) {
      suggestionsBox.style.display = "none";
      suggestionsBox.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(async () => {
      const results = await VoyaGoMap.searchAddress(query);
      if (results.length === 0) {
        suggestionsBox.style.display = "none";
        return;
      }

      suggestionsBox.innerHTML = results
        .map(
          (item) => `
            <div class="map-suggestion-item" onclick="selectSearchLocation(${item.lat}, ${item.lng}, '${item.name.replace(/'/g, "\\'")}')">
              <i class="fa-solid fa-location-dot me-2 text-success"></i>
              <strong>${item.shortName}</strong>
              <div class="small text-secondary text-truncate">${item.name}</div>
            </div>
          `
        )
        .join("");
      suggestionsBox.style.display = "block";
    }, 400);
  });

  // Hide suggestions on outside click
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });
}

/**
 * User clicks a search result
 */
function selectSearchLocation(lat, lng, address) {
  const searchInput = document.getElementById("mapSearchInput");
  const suggestionsBox = document.getElementById("mapSearchSuggestions");
  if (searchInput) searchInput.value = address;
  if (suggestionsBox) suggestionsBox.style.display = "none";

  setUserPosition(lat, lng, address, "search");
}

function updateLocationStatus(msg, type) {
  const el = document.getElementById("userDetectedAddress");
  if (el) el.textContent = msg;
}

