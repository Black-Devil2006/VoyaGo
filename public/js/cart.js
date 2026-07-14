// ===========================================
// VoyaGo Shopping Cart
// ===========================================

// Load Cart from Local Storage
let cart = JSON.parse(localStorage.getItem("voyagoCart")) || [];

// HTML Elements
const cartItems = document.getElementById("cartItems");
const subtotalElement = document.getElementById("subtotal");
const totalElement = document.getElementById("total");

// Delivery Charge
const deliveryCharge = 40;

// Save Cart
function saveCart() {
    localStorage.setItem("voyagoCart", JSON.stringify(cart));
}

// Display Cart
function displayCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="alert alert-warning text-center">
                <h4>Your Cart is Empty 🛒</h4>
                <a href="products.html" class="btn btn-success mt-3">
                    Continue Shopping
                </a>
            </div>
        `;

        subtotalElement.innerHTML = "₹0";
        totalElement.innerHTML = "₹40";

        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {

        subtotal += item.price * item.quantity;

        cartItems.innerHTML += `

        <div class="cart-item">

            <div class="row align-items-center">

                <div class="col-md-2">

                    <img src="${item.image}" class="img-fluid">

                </div>

                <div class="col-md-4">

                    <h4>${item.name}</h4>

                    <p>₹${item.price}</p>

                </div>

                <div class="col-md-3 text-center">

                    <button
                    class="btn btn-outline-danger qty-btn"
                    onclick="decreaseQty(${index})">

                    -

                    </button>

                    <span class="mx-3 fw-bold">

                    ${item.quantity}

                    </span>

                    <button
                    class="btn btn-outline-success qty-btn"
                    onclick="increaseQty(${index})">

                    +

                    </button>

                </div>

                <div class="col-md-2">

                    <strong>

                    ₹${item.price * item.quantity}

                    </strong>

                </div>

                <div class="col-md-1">

                    <button
                    class="btn btn-danger"
                    onclick="removeItem(${index})">

                    ✕

                    </button>

                </div>

            </div>

        </div>

        `;

    });

    subtotalElement.innerHTML = "₹" + subtotal;
    totalElement.innerHTML = "₹" + (subtotal + deliveryCharge);

}

// Increase Quantity
function increaseQty(index){

    cart[index].quantity++;

    saveCart();

    displayCart();

}

// Decrease Quantity
function decreaseQty(index){

    if(cart[index].quantity > 1){

        cart[index].quantity--;

    }else{

        cart.splice(index,1);

    }

    saveCart();

    displayCart();

}

// Remove Product
function removeItem(index){

    if(confirm("Remove this item from cart?")){

        cart.splice(index,1);

        saveCart();

        displayCart();

    }

}

// Empty Cart
function clearCart(){

    if(confirm("Clear your cart?")){

        cart=[];

        saveCart();

        displayCart();

    }

}

// Initial Load
displayCart();