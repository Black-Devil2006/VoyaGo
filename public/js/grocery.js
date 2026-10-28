// ===================================================
// VoyaGo Grocery Store Logic
// ===================================================

let allProducts = [];
let activeCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
  loadGroceryProducts();
});

async function loadGroceryProducts() {
  const grid = document.getElementById("groceryProductsGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-success"></div></div>`;

  try {
    const res = await fetch("/api/grocery/products");
    const data = await res.json();
    allProducts = data.products || [];
    renderGroceryProducts(allProducts);
  } catch (err) {
    VoyaGo.showToast("Loaded catalog from offline store.", "info");
    allProducts = [
      { _id: "prod_1", name: "Fresh Apples (1kg)", category: "Fruits & Veggies", price: 180, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", stock: 50, rating: 4.8 },
      { _id: "prod_2", name: "Organic Milk (1L)", category: "Dairy & Bakery", price: 65, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400", stock: 100, rating: 4.9 },
      { _id: "prod_3", name: "Whole Wheat Bread", category: "Dairy & Bakery", price: 45, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", stock: 30, rating: 4.6 },
      { _id: "prod_4", name: "Fresh Bananas (1 Dozen)", category: "Fruits & Veggies", price: 60, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", stock: 40, rating: 4.7 },
      { _id: "prod_5", name: "Dark Roasted Coffee Beans (250g)", category: "Beverages", price: 350, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400", stock: 25, rating: 4.9 },
      { _id: "prod_6", name: "Natural Potato Chips", category: "Snacks", price: 30, image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400", stock: 60, rating: 4.5 }
    ];
    renderGroceryProducts(allProducts);
  }
}

function renderGroceryProducts(list) {
  const grid = document.getElementById("groceryProductsGrid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5"><p class="text-secondary fs-5">No products found.</p></div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="glass-panel p-3 h-100 d-flex flex-column justify-content-between">
        <div>
          <div class="position-relative mb-2 text-center">
            <img src="${p.image}" alt="${p.name}" class="img-fluid rounded-3" style="height: 140px; width: 100%; object-fit: cover;">
            <span class="position-absolute top-0 end-0 m-1 badge bg-dark opacity-75 rounded-pill"><i class="fa-solid fa-star text-warning"></i> ${p.rating || 4.8}</span>
          </div>
          <small class="text-success fw-bold d-block mb-1">${p.category}</small>
          <h6 class="fw-bold mb-1 text-truncate">${p.name}</h6>
          <small class="text-secondary d-block mb-3">In stock • 15 min delivery</small>
        </div>

        <div class="pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
          <span class="fw-bold fs-5 text-success">₹${p.price}</span>
          <button class="btn-voyago btn-sm py-1 px-3" onclick="addGroceryToCart('${p._id}', '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.image}')">
            <i class="fa-solid fa-plus me-1"></i> Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCategory(category, btnElem) {
  activeCategory = category;
  document.querySelectorAll(".cat-btn").forEach(b => {
    b.classList.remove("btn-voyago", "active");
    b.classList.add("btn-voyago-outline");
  });
  if (btnElem) {
    btnElem.classList.remove("btn-voyago-outline");
    btnElem.classList.add("btn-voyago", "active");
  }

  applyGroceryFilters();
}

function handleGrocerySearch() {
  applyGroceryFilters();
}

function applyGroceryFilters() {
  const query = (document.getElementById("grocerySearchInput")?.value || "").toLowerCase();
  let result = [...allProducts];

  if (activeCategory !== "All") {
    result = result.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
  }

  if (query) {
    result = result.filter(p => p.name.toLowerCase().includes(query));
  }

  renderGroceryProducts(result);
}

function addGroceryToCart(id, name, price, image) {
  VoyaGo.addToCart({ id, name, price, image, quantity: 1 });
}
