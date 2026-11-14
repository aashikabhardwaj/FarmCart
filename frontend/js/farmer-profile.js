document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // ================= LOGIN CHECK =================
    if (!user) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

     // ================= FARMER ONLY =================
     if (user.role !== "farmer") {

        alert("Farmer login required!");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";
        return;
     }

    // ================= BASIC INFO =================
    document.getElementById("name").innerText = user.name;
    document.getElementById("email").innerText = user.email;
    document.getElementById("role").innerText = user.role;

    document.getElementById("accountType").innerText = "Verified Farmer";

    try {

        // ================= PRODUCTS =================

        const productRes = await fetch("http://localhost:8080/api/products");
        const products = await productRes.json();

        const myProducts = products.filter(product =>
            product.seller &&
            product.seller._id === user._id
        );

        document.getElementById("totalProducts").innerText =
            myProducts.length;


        // ================= ORDERS =================

        const orderRes = await fetch(
            "http://localhost:8080/api/farmer-orders",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (orderRes.ok) {

            const orders = await orderRes.json();

            document.getElementById("totalOrders").innerText =
                orders.length;

        } else {

            console.log("Orders API Error");

        }


        // ================= DEBUG =================

        console.log("USER :", user);
        console.log("PRODUCTS :", products);
        console.log("MY PRODUCTS :", myProducts);

    } catch (err) {

        console.error("Profile Error :", err);

    }

});


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}