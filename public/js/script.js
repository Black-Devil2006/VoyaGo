// ===================================================
// VoyaGo Core JavaScript Utilities & Theme Manager
// ===================================================

const VoyaGo = {
  // Theme Manager
  initTheme() {
    const savedTheme = localStorage.getItem("voyago_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("voyago_theme", next);
    return next;
  },

  // Auth Helpers
  getToken() {
    return localStorage.getItem("voyago_token");
  },

  getUser() {
    const u = localStorage.getItem("voyago_user");
    return u ? JSON.parse(u) : null;
  },

  setUser(user, token) {
    if (token) localStorage.setItem("voyago_token", token);
    if (user) localStorage.setItem("voyago_user", JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem("voyago_token");
    localStorage.removeItem("voyago_user");
    this.showToast("Logged out successfully", "info");
    setTimeout(() => {
      window.location.href = "/pages/login.html";
    }, 1000);
  },

  // Toast Notification System
  showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `voyago-toast toast-${type}`;
    const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Cart Local Storage Helper
  getCart() {
    const c = localStorage.getItem("voyago_cart");
    return c ? JSON.parse(c) : [];
  },

  addToCart(item) {
    const cart = this.getCart();
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += (item.quantity || 1);
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }
    localStorage.setItem("voyago_cart", JSON.stringify(cart));
    this.showToast(`Added ${item.name} to cart!`);
    this.updateCartBadge();
  },

  updateCartBadge() {
    const badge = document.getElementById("cartCountBadge");
    if (badge) {
      const cart = this.getCart();
      const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? "inline-block" : "none";
    }
  }
};

// Initialize Theme on load
document.addEventListener("DOMContentLoaded", () => {
  VoyaGo.initTheme();
  VoyaGo.updateCartBadge();
});