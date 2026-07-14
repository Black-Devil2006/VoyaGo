const pickup = document.getElementById("pickupDate");
const drop = document.getElementById("returnDate");
const total = document.getElementById("totalPrice");

const pricePerDay = 299;

function calculatePrice(){

    if(!pickup.value || !drop.value)
        return;

    const start = new Date(pickup.value);
    const end = new Date(drop.value);

    const diff = Math.ceil((end-start)/(1000*60*60*24));

    if(diff <= 0){

        total.innerHTML="Invalid Date";

        return;
    }

    total.innerHTML="₹"+(diff*pricePerDay);

}

pickup.addEventListener("change",calculatePrice);

drop.addEventListener("change",calculatePrice);