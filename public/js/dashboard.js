// ===================================================
// VoyaGo Dynamic User Dashboard Logic
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
});

async function loadDashboardData() {
  const token = VoyaGo.getToken();
  const localUser = VoyaGo.getUser();

  if (localUser) {
    updateDashboardUI(localUser);
  }

  try {
    const res = await fetch("/api/auth/profile", {
      headers: {
        "Authorization": token ? `Bearer ${token}` : ""
      }
    });
    const data = await res.json();
    if (res.ok && data.user) {
      VoyaGo.setUser(data.user);
      updateDashboardUI(data.user);
    }
  } catch (err) {
    // Graceful fallback to stored or demo user
  }
}

function updateDashboardUI(user) {
  const name = user.name || "Om Singh";
  const email = user.email || "om@voyago.com";
  const balance = user.walletBalance || 2450;
  const avatar = user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400";

  const hour = new Date().getHours();
  let timeGreeting = "Good Morning";
  if (hour >= 12 && hour < 17) timeGreeting = "Good Afternoon";
  if (hour >= 17) timeGreeting = "Good Evening";

  const header = document.getElementById("dashGreetingHeader");
  const emailElem = document.getElementById("dashUserEmail");
  const walletElem = document.getElementById("dashWalletBalance");
  const avatarImg = document.getElementById("userAvatarImg");

  if (header) header.textContent = `${timeGreeting}, ${name} 👋`;
  if (emailElem) emailElem.textContent = `${email} • Premium Member`;
  if (walletElem) walletElem.textContent = balance.toLocaleString();
  if (avatarImg) avatarImg.src = avatar;
}