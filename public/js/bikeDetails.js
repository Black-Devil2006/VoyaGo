const params = new URLSearchParams(window.location.search);

const id = Number(params.get("id")) || 1;

const bike = bikes.find(b => b.id === id);

document.getElementById("bikeImage").src = bike.image;
document.getElementById("bikeName").innerText = bike.name;
document.getElementById("bikeRating").innerText = "⭐ " + bike.rating;
document.getElementById("bikePrice").innerText = "₹" + bike.price + "/day";
document.getElementById("bikeEngine").innerText = bike.engine;
document.getElementById("bikeMileage").innerText = bike.mileage;
document.getElementById("bikeFuel").innerText = bike.fuel;
document.getElementById("bikeTransmission").innerText = bike.transmission;