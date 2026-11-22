// ===================================================
// VoyaGo Map & Geolocation Engine
// Powered by Leaflet, OpenStreetMap, CartoDB, Esri, and Nominatim
// ===================================================

const VoyaGoMap = {
  // Available Tile Layers (100% Free, No Watermark, No API Key Required)
  TILES: {
    streets: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      options: {
        attribution: 'Tiles &copy; Esri &mdash; StreetMap',
        maxZoom: 19
      }
    },
    humanitarian: {
      url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      options: {
        attribution: '&copy; OpenStreetMap contributors, Humanitarian style',
        maxZoom: 19,
        subdomains: "abc"
      }
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      options: {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 18
      }
    },
    topo: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      options: {
        attribution: 'Tiles &copy; Esri &mdash; Topographic',
        maxZoom: 19
      }
    }
  },

  // Default Fallback: Mumbai Central
  DEFAULT_LOCATION: {
    lat: 19.0760,
    lng: 72.8777,
    address: "Mumbai, Maharashtra, India"
  },

  /**
   * Acquire user's live position using HTML5 Geolocation with IP fallback.
   */
  async getUserLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            try {
              const address = await VoyaGoMap.reverseGeocode(lat, lng);
              resolve({ lat, lng, address, accuracy: pos.coords.accuracy, source: "gps" });
            } catch (e) {
              resolve({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, source: "gps" });
            }
          },
          async (err) => {
            console.warn("GPS lookup failed/denied, falling back to IP:", err.message);
            const ipLoc = await VoyaGoMap.getIpLocation();
            resolve(ipLoc);
          },
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
        );
      } else {
        VoyaGoMap.getIpLocation().then(resolve);
      }
    });
  },

  /**
   * Free IP Geolocation fallback when GPS permission is denied or unavailable
   */
  async getIpLocation() {
    // Try geojs first
    try {
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
      if (res.ok) {
        const d = await res.json();
        const lat = parseFloat(d.latitude);
        const lng = parseFloat(d.longitude);
        const address = `${d.city || ""}, ${d.region || ""}, ${d.country || ""}`.replace(/^,\s*|,\s*$/g, "");
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng, address: address || VoyaGoMap.DEFAULT_LOCATION.address, source: "ip" };
        }
      }
    } catch (e) {
      console.warn("GeoJS failed, trying ipapi:", e);
    }

    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const d = await res.json();
        const lat = parseFloat(d.latitude);
        const lng = parseFloat(d.longitude);
        const address = `${d.city || ""}, ${d.region || ""}, ${d.country_name || ""}`.replace(/^,\s*|,\s*$/g, "");
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng, address: address || VoyaGoMap.DEFAULT_LOCATION.address, source: "ip" };
        }
      }
    } catch (e) {
      console.warn("IP geolocation fallback failed:", e);
    }

    return { ...VoyaGoMap.DEFAULT_LOCATION, source: "default" };
  },

  /**
   * Reverse Geocode (Coordinates -> Address) via OpenStreetMap Nominatim
   */
  async reverseGeocode(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          // Format shorter readable string
          const parts = data.display_name.split(", ");
          return parts.slice(0, 4).join(", ");
        }
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  },

  /**
   * Forward Geocode (Address -> Coordinates) via OpenStreetMap Nominatim
   */
  async searchAddress(query) {
    if (!query || query.trim().length < 3) return [];
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (res.ok) {
        const data = await res.json();
        return data.map((item) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.display_name,
          shortName: item.display_name.split(", ").slice(0, 3).join(", ")
        }));
      }
    } catch (e) {
      console.warn("Search address failed:", e);
    }
    return [];
  },

  /**
   * Initialize a Leaflet map with standard tiles and controls
   */
  createMap(elementId, center = [VoyaGoMap.DEFAULT_LOCATION.lat, VoyaGoMap.DEFAULT_LOCATION.lng], zoom = 13) {
    const el = document.getElementById(elementId);
    if (!el || typeof L === "undefined") return null;

    const map = L.map(elementId, { zoomControl: true }).setView(center, zoom);

    // Default Street layer (Clean, Free, No API Key, No Watermark)
    const streetLayer = L.tileLayer(VoyaGoMap.TILES.streets.url, VoyaGoMap.TILES.streets.options).addTo(map);
    const hotLayer = L.tileLayer(VoyaGoMap.TILES.humanitarian.url, VoyaGoMap.TILES.humanitarian.options);
    const satelliteLayer = L.tileLayer(VoyaGoMap.TILES.satellite.url, VoyaGoMap.TILES.satellite.options);
    const topoLayer = L.tileLayer(VoyaGoMap.TILES.topo.url, VoyaGoMap.TILES.topo.options);

    // Layer switch control
    L.control.layers({
      "🗺️ Streets": streetLayer,
      "📍 Detailed (OSM HOT)": hotLayer,
      "🛰️ Satellite": satelliteLayer,
      "🏔️ Topo": topoLayer
    }, null, { position: "topright" }).addTo(map);
    }, null, { position: "topright" }).addTo(map);

    return map;
  },

  /**
   * Create an animated pulsing user marker icon
   */
  createUserIcon() {
    return L.divIcon({
      html: `
        <div class="user-pulse-marker">
          <div class="pulse-ring"></div>
          <div class="pulse-core"></div>
        </div>
      `,
      className: "custom-user-marker",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  },

  /**
   * Create vehicle icon (car, bike, auto, suv)
   */
  createVehicleIcon(type = "car") {
    const emojis = { car: "🚕", bike: "🏍️", auto: "🛺", suv: "🚙" };
    const emoji = emojis[type.toLowerCase()] || "🚕";
    return L.divIcon({
      html: `<div class="vehicle-map-pin">${emoji}</div>`,
      className: "custom-vehicle-marker",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17]
    });
  },

  /**
   * Create location pin (green pickup, pink destination)
   */
  createPinIcon(color = "#00b894", label = "📍") {
    return L.divIcon({
      html: `
        <div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:14px;">${label}</span>
        </div>
      `,
      className: "custom-pin-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  },

  /**
   * Haversine formula distance in kilometers
   */
  getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Spawn simulated moving nearby drivers around a center point
   */
  spawnNearbyDrivers(map, centerLat, centerLng, count = 4) {
    const types = ["car", "bike", "auto", "suv"];
    const names = ["Rajesh Kumar", "Amit Sharma", "Vikram Singh", "Pooja Verma"];
    const drivers = [];

    for (let i = 0; i < count; i++) {
      // Random offset ~500m to 1.5km
      const offsetLat = (Math.random() - 0.5) * 0.018;
      const offsetLng = (Math.random() - 0.5) * 0.018;
      const dLat = centerLat + offsetLat;
      const dLng = centerLng + offsetLng;
      const type = types[i % types.length];
      const name = names[i % names.length];
      const dist = VoyaGoMap.getDistance(centerLat, centerLng, dLat, dLng);
      const eta = Math.max(1, Math.round(dist * 3.5));

      const icon = VoyaGoMap.createVehicleIcon(type);
      const marker = L.marker([dLat, dLng], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:inherit; min-width:160px;">
          <h6 style="margin:0 0 4px; font-weight:700;">${name}</h6>
          <div style="color:#00b894; font-size:12px; font-weight:600;">⭐ 4.9 • ${type.toUpperCase()}</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">⏱️ ${eta} mins away (${dist.toFixed(1)} km)</div>
          <a href="/pages/rideBooking.html?driver=${encodeURIComponent(name)}&type=${type}" style="display:inline-block; margin-top:8px; padding:4px 10px; background:#00b894; color:#fff; text-decoration:none; border-radius:6px; font-size:11px; font-weight:600;">Book This Cab</a>
        </div>
      `);

      drivers.push({ marker, lat: dLat, lng: dLng, type, name, eta });
    }

    // Add gentle continuous drift animation
    setInterval(() => {
      drivers.forEach((d) => {
        d.lat += (Math.random() - 0.5) * 0.0004;
        d.lng += (Math.random() - 0.5) * 0.0004;
        d.marker.setLatLng([d.lat, d.lng]);
      });
    }, 3000);

    return drivers;
  }
};

window.VoyaGoMap = VoyaGoMap;

