const carContainer = document.getElementById("carContainer");
const searchCar = document.getElementById("searchCar");
const priceFilter = document.getElementById("priceFilter");

function displayCars(list){

    carContainer.innerHTML="";

    if(list.length===0){

        carContainer.innerHTML=`
        <div class="col-12 text-center">
            <h2>No Cars Found</h2>
        </div>`;

        return;
    }

    list.forEach(car=>{

        carContainer.innerHTML+=`

        <div class="col-lg-4 col-md-6">

            <div class="card shadow border-0 h-100">

                <img
                src="${car.image}"
                class="card-img-top"
                style="height:220px;object-fit:cover;">

                <div class="card-body">

                    <h4>${car.name}</h4>

                    <p>⭐ ${car.rating}</p>

                    <h3 class="text-success">
                    ₹${car.price}/day
                    </h3>

                    <p>👥 ${car.seats} Seats</p>

                    <p>⛽ ${car.fuel}</p>

                    <p>⚙ ${car.transmission}</p>

                    <button
                    class="btn btn-success w-100"
                    onclick="window.location.href='carDetails.html?id=${car.id}'">

                    View Details

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

function updateCars(){

    let filtered=[...cars];

    filtered=filtered.filter(car=>
        car.name.toLowerCase().includes(searchCar.value.toLowerCase())
    );

    if(priceFilter.value!=="all"){

        filtered=filtered.filter(car=>
            car.price<=Number(priceFilter.value)
        );

    }

    displayCars(filtered);

}

searchCar.addEventListener("keyup",updateCars);

priceFilter.addEventListener("change",updateCars);

displayCars(cars);