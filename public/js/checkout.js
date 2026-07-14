// ===========================================
// VoyaGo Checkout
// ===========================================

// Load Cart
const cart = JSON.parse(localStorage.getItem("voyagoCart")) || [];

const summary = document.getElementById("summary");
const grandTotal = document.getElementById("grandTotal");

const deliveryCharge = 40;

// Display Order Summary
function loadSummary(){

    if(cart.length === 0){

        summary.innerHTML = `
        <div class="alert alert-warning">
            Your cart is empty.
        </div>`;

        grandTotal.innerHTML = "₹0";

        return;
    }

    let subtotal = 0;

    summary.innerHTML = "";

    cart.forEach(item=>{

        subtotal += item.price * item.quantity;

        summary.innerHTML += `

        <div class="d-flex justify-content-between mb-2">

            <span>

            ${item.name} × ${item.quantity}

            </span>

            <strong>

            ₹${item.price * item.quantity}

            </strong>

        </div>

        `;

    });

    summary.innerHTML += `
        <hr>

        <div class="d-flex justify-content-between">

            <span>Delivery</span>

            <strong>₹${deliveryCharge}</strong>

        </div>
    `;

    grandTotal.innerHTML = "₹" + (subtotal + deliveryCharge);

}

loadSummary();

// ===========================================
// Place Order
// ===========================================

function placeOrder(){

    const name = document.getElementById("name").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const address = document.getElementById("address").value.trim();

    const payment = document.getElementById("payment").value;

    if(name===""){

        alert("Please enter your name.");

        return;

    }

    if(phone.length < 10){

        alert("Please enter a valid phone number.");

        return;

    }

    if(address===""){

        alert("Please enter your address.");

        return;

    }

    const order = {

        id: Date.now(),

        customer:name,

        phone,

        address,

        payment,

        items:cart,

        total:grandTotal.innerText,

        date:new Date().toLocaleString()

    };

    const orders = JSON.parse(localStorage.getItem("voyagoOrders")) || [];

    orders.push(order);

    localStorage.setItem("voyagoOrders",JSON.stringify(orders));

    localStorage.removeItem("voyagoCart");

    alert("🎉 Order Placed Successfully!");

    window.location.href="orderSuccess.html";

}