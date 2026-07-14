// =========================================
// VoyaGo Grocery Products
// =========================================

const products = [

{
    id:1,
    name:"Amul Gold Milk",
    category:"Milk",
    price:65,
    rating:4.8,
    image:"../images/grocery/amul-milk.jpg",
    stock:true,
    favorite:false
},

{
    id:2,
    name:"Mother Dairy Milk",
    category:"Milk",
    price:62,
    rating:4.7,
    image:"../images/grocery/mother-dairy.jpg",
    stock:true,
    favorite:false
},

{
    id:3,
    name:"Fresh Apples",
    category:"Fruits",
    price:180,
    rating:4.9,
    image:"../images/grocery/apple.jpg",
    stock:true,
    favorite:false
},

{
    id:4,
    name:"Bananas",
    category:"Fruits",
    price:55,
    rating:4.6,
    image:"../images/grocery/banana.jpg",
    stock:true,
    favorite:false
},

{
    id:5,
    name:"Mango",
    category:"Fruits",
    price:220,
    rating:4.9,
    image:"../images/grocery/mango.jpg",
    stock:true,
    favorite:false
},

{
    id:6,
    name:"Potato",
    category:"Vegetables",
    price:40,
    rating:4.5,
    image:"../images/grocery/potato.jpg",
    stock:true,
    favorite:false
},

{
    id:7,
    name:"Tomato",
    category:"Vegetables",
    price:35,
    rating:4.6,
    image:"../images/grocery/tomato.jpg",
    stock:true,
    favorite:false
},

{
    id:8,
    name:"Onion",
    category:"Vegetables",
    price:50,
    rating:4.4,
    image:"../images/grocery/onion.jpg",
    stock:true,
    favorite:false
},

{
    id:9,
    name:"Coca-Cola",
    category:"Beverages",
    price:40,
    rating:4.8,
    image:"../images/grocery/coke.jpg",
    stock:true,
    favorite:false
},

{
    id:10,
    name:"Sprite",
    category:"Beverages",
    price:40,
    rating:4.7,
    image:"../images/grocery/sprite.jpg",
    stock:true,
    favorite:false
}

];

const productContainer = document.getElementById("productContainer");
const searchProduct = document.getElementById("searchProduct");
const categoryFilter = document.getElementById("categoryFilter");

// Load cart
let cart = JSON.parse(localStorage.getItem("voyagoCart")) || [];

// Display Products
function displayProducts(list){

    productContainer.innerHTML = "";

    if(list.length===0){

        productContainer.innerHTML=`
        <div class="col-12 text-center">
            <h2>No Products Found 😔</h2>
        </div>`;

        return;

    }

    list.forEach(product=>{

        productContainer.innerHTML += `

        <div class="col-lg-4 col-md-6 mb-4">

            <div class="product-card">

                <img src="${product.image}">

                <h4>${product.name}</h4>

                <p>⭐ ${product.rating}</p>

                <h3 class="price">

                ₹${product.price}

                </h3>

                <span class="badge ${product.stock ? 'bg-success' : 'bg-danger'}">

                ${product.stock ? 'In Stock' : 'Out of Stock'}

                </span>

                <button
                class="btn btn-success w-100 mt-3"
                onclick="addToCart(${product.id})">

                Add To Cart

                </button>

            </div>

        </div>

        `;

    });

}

// Add To Cart
function addToCart(id){

    const product = products.find(p=>p.id===id);

    const existing = cart.find(item=>item.id===id);

    if(existing){

        existing.quantity++;

    }else{

        cart.push({

            ...product,

            quantity:1

        });

    }

    localStorage.setItem("voyagoCart",JSON.stringify(cart));

    alert(product.name + " added to cart 🛒");

}

// Search & Filter
function updateProducts(){

    let filtered=[...products];

    filtered = filtered.filter(product=>

        product.name.toLowerCase()

        .includes(searchProduct.value.toLowerCase())

    );

    if(categoryFilter.value!=="all"){

        filtered=filtered.filter(product=>

            product.category===categoryFilter.value

        );

    }

    displayProducts(filtered);

}

// Events

searchProduct.addEventListener("keyup",updateProducts);

categoryFilter.addEventListener("change",updateProducts);

// Load

displayProducts(products);