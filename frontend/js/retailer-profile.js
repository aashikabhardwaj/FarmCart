const user = JSON.parse(localStorage.getItem("user"));

const token = localStorage.getItem("token");

// ================= LOGIN CHECK =================

if (!user) {

    window.location.href = "login.html";

}

// ================= RETAILER CHECK =================

if (user.role !== "retailer") {

    alert("Retailer Login Required!");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}

// ================= BASIC INFO =================

document.getElementById("name").innerText = user.name;
document.getElementById("email").innerText = user.email;
document.getElementById("role").innerText = user.role;

document.getElementById("infoName").innerText = user.name;
document.getElementById("infoEmail").innerText = user.email;
document.getElementById("infoRole").innerText = user.role;


// ================= LOAD PROFILE DATA =================

async function loadRetailerProfile() {

    try {

        // -------- Products --------

        const productRes = await fetch(
            "http://localhost:8080/api/products"
        );

        const products = await productRes.json();

        const myProducts = products.filter(product =>
            product.retailer &&
            product.retailer._id === user._id
        );

        document.getElementById("totalProducts").innerText =
            myProducts.length;


        // -------- Earnings --------

        const earningRes = await fetch(
            "http://localhost:8080/api/retailer-earnings",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const earning = await earningRes.json();

        document.getElementById("totalRevenue").innerText =
            "₹" + earning.totalRevenue;

        document.getElementById("totalOrders").innerText =
            earning.totalOrders;


        // -------- Debug --------

        console.log("Retailer :", user);
        console.log("Products :", myProducts);
        console.log("Earnings :", earning);

    }

    catch (err) {

        console.log("Profile Error :", err);

    }

}

loadRetailerProfile();


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}