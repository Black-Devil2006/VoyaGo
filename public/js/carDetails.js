// =========================================
// VoyaGo Car Details JS
// =========================================

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id")) || 1;

const car = cars.find(c => c.id === id);

if (car) {
    document.getElementById("carImage").src = car.image;
    document.getElementById("carName").innerText = car.name;
    document.getElementById("carRating").innerText = "★ " + car.rating;
    document.getElementById("carPrice").innerText = "₹" + car.price + "/day";
    document.getElementById("carSeats").innerText = car.seats;
    document.getElementById("carFuel").innerText = car.fuel;
    document.getElementById("carTransmission").innerText = car.transmission;
    document.getElementById("carMileage").innerText = car.seats === 7 ? "12 km/l" : "15 km/l";
    
    const availabilityEl = document.getElementById("carAvailability");
    if (car.available) {
        availabilityEl.innerText = "Available";
        availabilityEl.style.color = "green";
    } else {
        availabilityEl.innerText = "Booked";
        availabilityEl.style.color = "red";
    }
}

function bookCar() {
    window.location.href = `booking.html?type=car&id=${id}`;
}
