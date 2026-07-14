// =====================================
// VoyaGo Bike Rentals
// =====================================

const bikeContainer = document.getElementById("bikeContainer");
const searchBike = document.getElementById("searchBike");
const priceFilter = document.getElementById("priceFilter");

// Display Bikes
function displayBikes(list) {

    bikeContainer.innerHTML = "";

    if (list.length === 0) {

        bikeContainer.innerHTML = `
            <div class="col-12 text-center mt-5">
                <h2>No Bikes Found 😔</h2>
            </div>
        `;

        return;
    }

    list.forEach(bike => {

        bikeContainer.innerHTML += `

        <div class="col-lg-4 col-md-6 mb-4">

            <div class="card shadow-lg border-0 h-100">

                <img
                    src="${bike.image}"
                    class="card-img-top"
                    style="height:220px;object-fit:cover;">

                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-center">

                        <h5>${bike.name}</h5>

                        <button
                            class="btn btn-light"
                            onclick="toggleWishlist(${bike.id})">

                            ${bike.favorite ? "❤️" : "🤍"}

                        </button>

                    </div>

                    <p class="mt-2">

                        ⭐ ${bike.rating}

                    </p>

                    <h4 class="text-success">

                        ₹${bike.price}/day

                    </h4>

                    <p>

                        Engine :
                        <strong>${bike.engine}</strong>

                    </p>

                    <p>

                        Mileage :
                        <strong>${bike.mileage}</strong>

                    </p>

                    <p>

                        Fuel :
                        <strong>${bike.fuel}</strong>

                    </p>

                    <p>

                        Transmission :
                        <strong>${bike.transmission}</strong>

                    </p>

                    <p>

                        ${
                            bike.available
                            ? '<span class="badge bg-success">Available</span>'
                            : '<span class="badge bg-danger">Booked</span>'
                        }

                    </p>

                    <button
                        class="btn btn-success w-100 mt-3"
                        onclick="window.location.href='bikeDetails.html?id=${bike.id}'">

                        View Details

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

// Wishlist
function toggleWishlist(id) {

    const bike = bikes.find(b => b.id === id);

    bike.favorite = !bike.favorite;

    displayBikes(filteredBikes());

}

// Search + Price Filter
function filteredBikes() {

    let filtered = [...bikes];

    const search = searchBike.value.toLowerCase();

    filtered = filtered.filter(bike =>
        bike.name.toLowerCase().includes(search)
    );

    const price = priceFilter.value;

    if (price !== "all") {

        filtered = filtered.filter(bike =>
            bike.price <= Number(price)
        );

    }

    return filtered;

}

// Update Screen
function updateBikes() {

    displayBikes(filteredBikes());

}

// Event Listeners
searchBike.addEventListener("keyup", updateBikes);

priceFilter.addEventListener("change", updateBikes);

// Initial Load
displayBikes(bikes);