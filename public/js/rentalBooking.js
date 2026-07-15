// =========================================
// VoyaGo Dynamic Rental Booking JS
// =========================================

const params = new URLSearchParams(window.location.search);
const type = params.get("type") || "bike"; // "bike" or "car"
const id = Number(params.get("id")) || 1;

const pickup = document.getElementById("pickupDate");
const drop = document.getElementById("returnDate");
const total = document.getElementById("totalPrice");

let pricePerDay = 0;
let vehicleName = "";

// Find vehicle in database
let vehicle = null;
if (type === "car") {
    vehicle = cars.find(c => c.id === id);
} else {
    vehicle = bikes.find(b => b.id === id);
}

if (vehicle) {
    pricePerDay = vehicle.price;
    vehicleName = vehicle.name;

    // Set page labels
    document.getElementById("navTitle").innerText = type === "car" ? "🚗 Car Rental Booking" : "🏍 Bike Rental Booking";
    document.getElementById("vehicleImage").src = vehicle.image;
    document.getElementById("vehicleName").innerText = vehicle.name;
    document.getElementById("vehicleRating").innerText = "⭐ " + vehicle.rating + " (Verified Partner)";
    document.getElementById("vehiclePrice").innerText = "₹" + vehicle.price + " / Day";

    // Set specs
    const specsContainer = document.getElementById("vehicleSpecs");
    specsContainer.innerHTML = "";

    if (type === "car") {
        specsContainer.innerHTML = `
            <li class="list-group-item"><strong>Seats:</strong> ${vehicle.seats} Seater</li>
            <li class="list-group-item"><strong>Fuel:</strong> ${vehicle.fuel}</li>
            <li class="list-group-item"><strong>Transmission:</strong> ${vehicle.transmission}</li>
        `;
    } else {
        specsContainer.innerHTML = `
            <li class="list-group-item"><strong>Engine:</strong> ${vehicle.engine}</li>
            <li class="list-group-item"><strong>Mileage:</strong> ${vehicle.mileage}</li>
            <li class="list-group-item"><strong>Fuel:</strong> ${vehicle.fuel}</li>
            <li class="list-group-item"><strong>Transmission:</strong> ${vehicle.transmission}</li>
        `;
    }
}

// Set min dates to today to prevent booking in past
const today = new Date().toISOString().split("T")[0];
pickup.min = today;
drop.min = today;

function calculatePrice() {
    if (!pickup.value || !drop.value) return;

    const start = new Date(pickup.value);
    const end = new Date(drop.value);

    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (diff <= 0) {
        total.innerHTML = "Invalid Dates";
        return;
    }

    total.innerHTML = "₹" + (diff * pricePerDay);
}

pickup.addEventListener("change", () => {
    drop.min = pickup.value; // return date cannot be before pickup date
    calculatePrice();
});
drop.addEventListener("change", calculatePrice);

function confirmBooking() {
    if (!pickup.value || !drop.value) {
        alert("Please select both Pickup and Return dates.");
        return;
    }

    const start = new Date(pickup.value);
    const end = new Date(drop.value);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (diff <= 0) {
        alert("Please select a valid return date after pickup date.");
        return;
    }

    // Save rental to LocalStorage for History page
    const rental = {
        id: "VR" + Math.floor(10000 + Math.random() * 90000),
        vehicleName: vehicleName,
        type: type,
        pickupDate: pickup.value,
        returnDate: drop.value,
        totalPrice: diff * pricePerDay,
        status: "Confirmed",
        date: new Date().toLocaleDateString()
    };

    const rentals = JSON.parse(localStorage.getItem("voyagoRentals")) || [];
    rentals.push(rental);
    localStorage.setItem("voyagoRentals", JSON.stringify(rentals));

    // Save active booking details for success screen
    localStorage.setItem("latestRental", JSON.stringify(rental));

    alert("🎉 Booking Confirmed successfully!");
    window.location.href = "rentalSuccess.html";
}