// =======================================
// VoyaGo Dashboard JavaScript
// =======================================

// Welcome Message
window.addEventListener("load", () => {

    setTimeout(() => {

        console.log("Welcome to VoyaGo Dashboard 🚀");

    }, 500);

});

// ------------------------------
// Dark Mode
// ------------------------------

const darkBtn = document.getElementById("darkModeBtn");

let darkMode = false;

darkBtn.addEventListener("click", () => {

    darkMode = !darkMode;

    if (darkMode) {

        document.body.style.background = "#111827";

        document.querySelector(".main-content").style.background = "#111827";

        document.querySelectorAll(".card").forEach(card => {
            card.style.background = "#1F2937";
            card.style.color = "white";
        });

        document.querySelectorAll(".stat-box").forEach(box => {
            box.style.background = "#1F2937";
            box.style.color = "white";
        });

        document.querySelectorAll(".activity-card").forEach(card => {
            card.style.background = "#1F2937";
            card.style.color = "white";
        });

        darkBtn.innerHTML = "☀️";

    } else {

        document.body.style.background = "#eef2f7";

        document.querySelector(".main-content").style.background = "#eef2f7";

        document.querySelectorAll(".card").forEach(card => {
            card.style.background = "white";
            card.style.color = "#111";
        });

        document.querySelectorAll(".stat-box").forEach(box => {
            box.style.background = "white";
            box.style.color = "#111";
        });

        document.querySelectorAll(".activity-card").forEach(card => {
            card.style.background = "white";
            card.style.color = "#111";
        });

        darkBtn.innerHTML = "🌙";

    }

});

// ------------------------------
// Notification
// ------------------------------

const bell = document.querySelector(".fa-bell");

bell.addEventListener("click", () => {

    alert("🔔 No new notifications");

});

// ------------------------------
// Dashboard Cards Animation
// ------------------------------

const cards = document.querySelectorAll(".card");

cards.forEach((card, index) => {

    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";

    setTimeout(() => {

        card.style.transition = "0.5s";

        card.style.opacity = "1";

        card.style.transform = "translateY(0px)";

    }, index * 200);

});

// ------------------------------
// Statistics Counter Animation
// ------------------------------

const statValues = [26, 9, 31, 2450];

const statBoxes = document.querySelectorAll(".stat-box h2");

statBoxes.forEach((box, index) => {

    let count = 0;

    const target = statValues[index];

    const interval = setInterval(() => {

        count++;

        if (index === 3) {

            box.innerHTML = "₹" + count;

        } else {

            box.innerHTML = count;

        }

        if (count >= target) {

            clearInterval(interval);

        }

    }, 10);

});

// ------------------------------
// Sidebar Highlight
// ------------------------------

const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(i => i.classList.remove("active"));

        item.classList.add("active");

    });

});

// ------------------------------
// Quick Action Buttons
// ------------------------------

const quickButtons = document.querySelectorAll(".activity-card button");

quickButtons.forEach(button => {

    button.addEventListener("mouseenter", () => {

        button.style.transform = "scale(1.03)";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "scale(1)";

    });

});

// ------------------------------
// Greeting Based on Time
// ------------------------------

const heading = document.querySelector(".topbar h2");

const hour = new Date().getHours();

if (hour < 12) {

    heading.innerHTML = "Good Morning, Om ☀️";

} else if (hour < 17) {

    heading.innerHTML = "Good Afternoon, Om 🌤️";

} else {

    heading.innerHTML = "Good Evening, Om 🌙";

}