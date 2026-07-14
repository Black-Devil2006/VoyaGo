// ===============================
// VoyaGo Ride Tracking
// ===============================

// Initialize Map
const map = L.map("map").setView([28.6139, 77.2090], 14);

// OpenStreetMap Tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap Contributors"
}).addTo(map);

// ------------------------------
// Driver Icon
// ------------------------------

const driverIcon = L.icon({
    iconUrl: "../images/icon/driver-icon.png",
    iconSize: [55, 55],
    iconAnchor: [27, 55],
    popupAnchor: [0, -45]
});

// ------------------------------
// Locations
// ------------------------------

const pickup = [28.6139, 77.2090];
const destination = [28.6239, 77.2290];

// Driver Route
const driverRoute = [

    [28.6039,77.1990],
    [28.6055,77.2010],
    [28.6075,77.2035],
    [28.6098,77.2060],
    [28.6115,77.2078],
    [28.6130,77.2088],
    [28.6139,77.2090]

];

// ------------------------------
// Markers
// ------------------------------

const pickupMarker = L.marker(pickup)
.addTo(map)
.bindPopup("📍 Pickup Location");

const destinationMarker = L.marker(destination)
.addTo(map)
.bindPopup("🏁 Destination");

const driverMarker = L.marker(driverRoute[0], {
    icon: driverIcon
})
.addTo(map)
.bindPopup("🚖 Driver");

// ------------------------------
// Draw Route
// ------------------------------

L.polyline(
    [pickup, destination],
    {
        color: "#00B894",
        weight: 6
    }
).addTo(map);

// ------------------------------
// UI Elements
// ------------------------------

const statusText = document.getElementById("rideStatus");
const etaText = document.getElementById("eta");

// ------------------------------
// Ride Status
// ------------------------------

const rideSteps = [

    {
        status: "Driver is on the way",
        eta: "6 mins"
    },

    {
        status: "Driver is getting closer",
        eta: "4 mins"
    },

    {
        status: "Driver is nearby",
        eta: "2 mins"
    },

    {
        status: "Driver has arrived",
        eta: "0 mins"
    }

];

// ------------------------------
// Driver Animation
// ------------------------------

let current = 0;

const moveDriver = setInterval(() => {

    if(current >= driverRoute.length){

        clearInterval(moveDriver);

        statusText.innerHTML = "✅ Driver Arrived";

        etaText.innerHTML = "0 mins";

        alert("🚖 Your driver has arrived!");

        return;

    }

    driverMarker.setLatLng(driverRoute[current]);

    if(current < rideSteps.length){

        statusText.innerHTML = rideSteps[current].status;

        etaText.innerHTML = rideSteps[current].eta;

    }

    current++;

},2000);

// ------------------------------
// Call Driver Button
// ------------------------------

const callBtn = document.querySelector(".btn-success");

if(callBtn){

    callBtn.addEventListener("click",()=>{

        alert("📞 Calling Driver...");

    });

}

// ------------------------------
// Chat Button
// ------------------------------

const chatBtn = document.querySelector(".btn-primary");

if(chatBtn){

    chatBtn.addEventListener("click",()=>{

        alert("💬 Chat feature will be available soon.");

    });

}

// ------------------------------
// Cancel Ride
// ------------------------------

const cancelBtn = document.querySelector(".btn-danger");

if(cancelBtn){

    cancelBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        const confirmRide = confirm("Do you really want to cancel this ride?");

        if(confirmRide){

            alert("Ride Cancelled!");

            window.location.href = "index.html";

        }

    });

}