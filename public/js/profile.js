// =======================================
// VoyaGo Profile
// =======================================

// Elements
const userName = document.getElementById("userName");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const cityInput = document.getElementById("city");

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

// -----------------------------
// Load Saved Data
// -----------------------------

window.addEventListener("load", () => {

    const profile = JSON.parse(localStorage.getItem("voyagoProfile"));

    if(profile){

        nameInput.value = profile.name;
        emailInput.value = profile.email;
        phoneInput.value = profile.phone;
        cityInput.value = profile.city;

        userName.innerHTML = profile.name;

    }

    disableInputs();

});

// -----------------------------
// Disable Inputs
// -----------------------------

function disableInputs(){

    nameInput.disabled = true;
    emailInput.disabled = true;
    phoneInput.disabled = true;
    cityInput.disabled = true;

}

// -----------------------------
// Enable Inputs
// -----------------------------

function enableInputs(){

    nameInput.disabled = false;
    emailInput.disabled = false;
    phoneInput.disabled = false;
    cityInput.disabled = false;

    nameInput.focus();

}

// -----------------------------
// Edit Button
// -----------------------------

editBtn.addEventListener("click",()=>{

    enableInputs();

});

// -----------------------------
// Save Button
// -----------------------------

saveBtn.addEventListener("click",()=>{

    const name=nameInput.value.trim();
    const email=emailInput.value.trim();
    const phone=phoneInput.value.trim();
    const city=cityInput.value.trim();

    if(name===""){

        alert("Please enter your name");
        return;

    }

    if(email===""){

        alert("Please enter your email");
        return;

    }

    if(phone===""){

        alert("Please enter your phone number");
        return;

    }

    if(city===""){

        alert("Please enter your city");
        return;

    }

    const profile={

        name,
        email,
        phone,
        city

    };

    localStorage.setItem("voyagoProfile",JSON.stringify(profile));

    userName.innerHTML=name;

    disableInputs();

    alert("✅ Profile Updated Successfully!");

});

// -----------------------------
// Live Name Update
// -----------------------------

nameInput.addEventListener("keyup",()=>{

    userName.innerHTML=nameInput.value;

});

// -----------------------------
// Email Validation
// -----------------------------

emailInput.addEventListener("blur",()=>{

    const email=emailInput.value;

    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(email!=="" && !regex.test(email)){

        alert("Please enter a valid email.");

        emailInput.focus();

    }

});

// -----------------------------
// Phone Validation
// -----------------------------

phoneInput.addEventListener("blur",()=>{

    const phone=phoneInput.value.replace(/\D/g,'');

    if(phone.length<10){

        alert("Please enter a valid phone number.");

        phoneInput.focus();

    }

});