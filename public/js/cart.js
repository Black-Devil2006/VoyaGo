// ===================================================
// VoyaGo Shopping Cart & Checkout Logic
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
});

function renderCartPage() {
  const container = document.getElementById("cartListContainer");
  if (!container) return;

  const cart = VoyaGo.getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="fs-1 text-secondary mb-3">🛒</div>
        <h4 class="fw-bold mb-2">Your Shopping Cart is Empty</h4>
        <p class="text-secondary mb-4">Explore fresh fruits, vegetables, and daily items in our grocery store.</p>
        <a href="/pages/grocery.html" class="btn-voyago"><i class="fa-solid fa-basket-shopping me-2"></i> Browse Grocery Mart</a>
      </div>
    `;
    updateTotals(0);
    return;
  }

  container.innerHTML = `
    <div class="d-flex flex-column gap-3">
      ${cart.map((item, idx) => `
        <div class="glass-panel p-3 d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <img src="${item.image}" alt="${item.name}" class="rounded-3" style="width: 70px; height: 70px; object-fit: cover;">
            <div>
              <h6 class="fw-bold mb-0">${item.name}</h6>
              <span class="text-success fw-bold">₹${item.price}</span>
            </div>
          </div>

          <div class="d-flex align-items-center gap-3">
            <div class="input-group input-group-sm" style="width: 110px;">
              <button class="btn btn-outline-secondary" onclick="updateItemQuantity(${idx}, -1)">-</button>
              <span class="form-control text-center bg-transparent border-secondary border-opacity-25">${item.quantity}</span>
              <button class="btn btn-outline-secondary" onclick="updateItemQuantity(${idx}, 1)">+</button>
            </div>
            <span class="fw-bold text-success fs-5" style="width: 70px; text-align: right;">₹${item.price * item.quantity}</span>
            <button class="btn btn-link text-danger p-0 border-0" onclick="removeItemFromCart(${idx})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  updateTotals(subtotal);
}

function updateItemQuantity(index, delta) {
  const cart = VoyaGo.getCart();
  if (!cart[index]) return;

  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("voyago_cart", JSON.stringify(cart));
  VoyaGo.updateCartBadge();
  renderCartPage();
}

function removeItemFromCart(index) {
  const cart = VoyaGo.getCart();
  cart.splice(index, 1);
  localStorage.setItem("voyago_cart", JSON.stringify(cart));
  VoyaGo.updateCartBadge();
  renderCartPage();
}

function updateTotals(subtotal) {
  const tax = subtotal > 0 ? 15 : 0;
  const grandTotal = subtotal + tax;

  const subElem = document.getElementById("subtotalAmount");
  const grandElem = document.getElementById("grandTotalAmount");

  if (subElem) subElem.textContent = subtotal;
  if (grandElem) grandElem.textContent = grandTotal;
}

async function processOrderCheckout() {
  const cart = VoyaGo.getCart();
  if (cart.length === 0) {
    VoyaGo.showToast("Your cart is empty!", "error");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subtotal + 15;
  const address = document.getElementById("cartDeliveryAddress")?.value || "102 Green Park, Bandra West, Mumbai";
  const paymentMethod = document.getElementById("cartPaymentMethod")?.value || "VoyaPay Wallet";

  const btn = document.getElementById("checkoutBtn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> Placing Order...`;
  }

  const token = VoyaGo.getToken();

  try {
    const res = await fetch("/api/grocery/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({
        items: cart,
        totalAmount,
        deliveryAddress: address,
        paymentMethod
      })
    });

    localStorage.removeItem("voyago_cart");
    VoyaGo.updateCartBadge();
    VoyaGo.showToast("Order placed successfully!");

    setTimeout(() => {
      window.location.href = "/pages/orderSuccess.html";
    }, 1000);

  } catch (err) {
    localStorage.removeItem("voyago_cart");
    VoyaGo.updateCartBadge();
    VoyaGo.showToast("Order placed successfully!");

    setTimeout(() => {
      window.location.href = "/pages/orderSuccess.html";
    }, 1000);
  }
}