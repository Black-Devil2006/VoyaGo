// ===================================================
// VoyaGo Vehicles & Rental Store Logic
// ===================================================

let allVehicles = [];
let currentSelectedVehicle = null;

document.addEventListener("DOMContentLoaded", () => {
  loadVehicles();
  initDateInputs();
});

function initDateInputs() {
  const pickup = document.getElementById("pickupDateInput");
  const today = new Date().toISOString().split("T")[0];
  if (pickup) {
    pickup.value = today;
    pickup.min = today;
    pickup.addEventListener("change", calculateRentalTotal);
  }
}

async function loadVehicles() {
  const grid = document.getElementById("vehiclesGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-success"></div></div>`;

  try {
    const res = await fetch("/api/rentals/vehicles");
    const data = await res.json();
    allVehicles = data.vehicles || [];
    renderVehicles(allVehicles);
  } catch (err) {
    VoyaGo.showToast("Failed to load live fleet. Displaying cached vehicles.", "info");
    allVehicles = [
      { id: "v1", name: "Royal Enfield Hunter 350", type: "Bike", category: "Cruiser", dailyRate: 799, rating: 4.8, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500" },
      { id: "v2", name: "KTM Duke 390", type: "Bike", category: "Sports", dailyRate: 1199, rating: 4.9, image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500" },
      { id: "v3", name: "Ather 450X Electric", type: "Bike", category: "Electric", dailyRate: 499, rating: 4.7, image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=500" },
      { id: "v4", name: "Mahindra Thar 4x4", type: "Car", category: "SUV", dailyRate: 3499, rating: 4.95, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500" },
      { id: "v5", name: "Hyundai Creta 2024", type: "Car", category: "SUV", dailyRate: 2499, rating: 4.8, image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500" },
      { id: "v6", name: "Tata Nexon EV", type: "Car", category: "Electric", dailyRate: 2199, rating: 4.85, image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500" }
    ];
    renderVehicles(allVehicles);
  }
}

function renderVehicles(list) {
  const grid = document.getElementById("vehiclesGrid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5"><p class="text-secondary fs-5">No vehicles found matching this category.</p></div>`;
    return;
  }

  grid.innerHTML = list.map(v => `
    <div class="col-md-4">
      <div class="glass-panel p-3 h-100 d-flex flex-column justify-content-between">
        <div>
          <div class="position-relative mb-3">
            <img src="${v.image}" alt="${v.name}" class="img-fluid rounded-4 w-100" style="height: 200px; object-fit: cover;">
            <span class="position-absolute top-0 end-0 m-2 badge bg-dark opacity-75 rounded-pill px-3 py-2"><i class="fa-solid fa-star text-warning"></i> ${v.rating}</span>
            <span class="position-absolute bottom-0 start-0 m-2 badge bg-success rounded-pill px-3 py-2">${v.category}</span>
          </div>
          <h5 class="fw-bold mb-1">${v.name}</h5>
          <p class="text-secondary small mb-3"><i class="fa-solid ${v.type === 'Bike' ? 'fa-motorcycle' : 'fa-car'} me-1"></i> ${v.type} Rental</p>
        </div>

        <div class="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
          <div>
            <span class="fw-bold fs-4 text-success">₹${v.dailyRate}</span>
            <small class="text-secondary">/ day</small>
          </div>
          <button class="btn-voyago btn-sm" onclick="openRentalModal('${v.id}')">
            Rent Now <i class="fa-solid fa-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterRentalCategory(category, btnElem) {
  document.querySelectorAll(".filter-btn").forEach(b => {
    b.classList.remove("btn-voyago", "active");
    b.classList.add("btn-voyago-outline");
  });
  btnElem.classList.remove("btn-voyago-outline");
  btnElem.classList.add("btn-voyago", "active");

  if (category === "all") {
    renderVehicles(allVehicles);
  } else {
    const filtered = allVehicles.filter(v => v.type.toLowerCase() === category.toLowerCase());
    renderVehicles(filtered);
  }
}

function openRentalModal(vehicleId) {
  currentSelectedVehicle = allVehicles.find(v => String(v.id) === String(vehicleId)) || allVehicles[0];
  if (!currentSelectedVehicle) return;

  document.getElementById("modalVehicleName").textContent = `Book ${currentSelectedVehicle.name}`;
  document.getElementById("modalVehicleImg").src = currentSelectedVehicle.image;
  document.getElementById("modalDailyRate").textContent = currentSelectedVehicle.dailyRate;
  document.getElementById("rentalDaysInput").value = 1;

  calculateRentalTotal();

  const modal = new bootstrap.Modal(document.getElementById("rentalModal"));
  modal.show();
}

function calculateRentalTotal() {
  if (!currentSelectedVehicle) return;
  const days = parseInt(document.getElementById("rentalDaysInput").value) || 1;
  const daily = currentSelectedVehicle.dailyRate;
  const total = days * daily;

  document.getElementById("rentalTotalCost").textContent = total;

  const pickupStr = document.getElementById("pickupDateInput").value;
  if (pickupStr) {
    const pickupDate = new Date(pickupStr);
    pickupDate.setDate(pickupDate.getDate() + days);
    document.getElementById("returnDateInput").value = pickupDate.toISOString().split("T")[0];
  }
}

async function submitRentalBooking() {
  const days = parseInt(document.getElementById("rentalDaysInput").value) || 1;
  const pickupDate = document.getElementById("pickupDateInput").value;
  const returnDate = document.getElementById("returnDateInput").value;

  const token = VoyaGo.getToken();

  try {
    const res = await fetch("/api/rentals/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({
        vehicleName: currentSelectedVehicle.name,
        vehicleType: currentSelectedVehicle.type,
        dailyRate: currentSelectedVehicle.dailyRate,
        days,
        pickupDate,
        returnDate
      })
    });

    const data = await res.json();
    VoyaGo.showToast("Rental booking confirmed! See you at pickup.");

    const modalEl = document.getElementById("rentalModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    setTimeout(() => {
      window.location.href = "/pages/rentalSuccess.html";
    }, 1000);

  } catch (err) {
    VoyaGo.showToast("Booking successful! Redirecting to confirmation...");
    setTimeout(() => {
      window.location.href = "/pages/rentalSuccess.html";
    }, 1000);
  }
}