
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}
if (user.role !== "customer" && user.role !== "buyer") {

    alert("Customer login required!");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}

document.getElementById("name").innerText =
    user.name;

document.getElementById("email").innerText =
    user.email;

document.getElementById("role").innerText =
    user.role;

document.getElementById("accountType").innerText =
    "Verified Customer";

const token = localStorage.getItem("token");

async function loadCustomerProfile() {

    try {

        const res = await fetch(
            "http://localhost:8080/api/my-orders",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (res.ok) {

            const orders = await res.json();

            document.getElementById("totalOrders").innerText =
                orders.length;

        }

        const cartRes = await fetch(
    "http://localhost:8080/api/cart",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

if (cartRes.ok) {

    const cart = await cartRes.json();

    document.getElementById("totalCart").innerText =
        cart.items.length;

}

    } catch (err) {

        console.log(err);

    }

}


async function loadEcoRewards() {

    try {

        const res = await fetch(
            "http://localhost:8080/api/profile/rewards",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) return;

        const data = await res.json();

       // document.getElementById("ecoPoints").innerText =
           // data.ecoPoints || 0;

        document.getElementById("ecoStatus").innerText =
            data.ecoStatus || "Eco Beginner";

        document.getElementById("greenScore").innerText =
            data.greenScore || 0;

        if (document.getElementById("totalReturns")) {
            document.getElementById("totalReturns").innerText =
                data.totalReturns || 0;
        }

        // Progress Bar
        let progress = 0;
        let nextText = "";

        if (data.ecoPoints < 100) {
            progress = data.ecoPoints;
            nextText = `${100 - data.ecoPoints} points required for Eco Supporter`;
        }
        else if (data.ecoPoints < 300) {
            progress = ((data.ecoPoints - 100) / 200) * 100;
            nextText = `${300 - data.ecoPoints} points required for Eco Champion`;
        }
        else if (data.ecoPoints < 700) {
            progress = ((data.ecoPoints - 300) / 400) * 100;
            nextText = `${700 - data.ecoPoints} points required for Eco Hero`;
        }
        else {
            progress = 100;
            nextText = "🎉 Highest Eco Level Achieved";
        }

        document.getElementById("ecoProgress").style.width =
            progress + "%";

        document.getElementById("nextLevel").innerText =
            nextText;

    }

    catch (err) {

        console.log(err);

    }

}

function toggleRewards(){

    const box = document.getElementById("rewardDetails");
    const arrow = document.getElementById("rewardArrow");


    if(box.style.display === "none"){

        box.style.display="block";
        arrow.classList.remove("bi-chevron-down");
        arrow.classList.add("bi-chevron-up");

    }
    else{

        box.style.display="none";
        arrow.classList.remove("bi-chevron-up");
        arrow.classList.add("bi-chevron-down");

    }

}

async function loadSellerRewards(){

    try{

        const res = await fetch(
            "http://localhost:8080/api/profile/seller-wallet",
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );


        if(!res.ok) return;


        const data = await res.json();


        const container = document.getElementById("sellerRewards");


        if(data.sellerRewards.length === 0){

            container.innerHTML = `
                <p class="text-muted">
                    No seller rewards available yet.
                </p>
            `;

            return;
        }



        container.innerHTML = "";


        data.sellerRewards.forEach(reward => {
            const sellerType =  reward.seller.role === "farmer"
             ? "Farmer" : "Retailer";              


            let discount = (reward.points / 10) * 5;


             container.innerHTML += `

                 <div class="seller-reward-card p-3 border rounded mb-3">

                 <h6 class="fw-bold mb-2">
                 ${reward.seller.name}
                 </h6>

                 <span class="badge bg-light text-dark">

                 <i class="${
                 reward.seller.role === "farmer"
                 ?
                 "bi bi-tree-fill text-success"
                  :
                 "bi bi-shop text-primary"
                 }"></i>

                 ${sellerType}

                 </span>

                 <div class="mt-3">

                 <span class="badge bg-success">
                  ${reward.points} Coins
                  </span>

                 <span class="badge bg-warning text-dark ms-2">
                   Worth ₹${discount}
                 </span>

                 </div>

                 <button
                 class="btn btn-outline-success btn-sm mt-3"
                 onclick="viewSellerProducts('${reward.seller._id}',
                   '${reward.seller.role}')">

                 View Products

                 </button>

                 </div>

                `;
            });


        }
         catch(err){

            console.log(err);

      }

}

loadCustomerProfile();
loadEcoRewards();
loadSellerRewards();

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}
function viewSellerProducts(sellerId, role){

    if(role === "farmer"){
console.log("Seller:", sellerId);
    console.log("Role:", role);

        window.location.href =
        `farmers.html?seller=${sellerId}`;

    }
    else{

        window.location.href =
        `products.html?seller=${sellerId}`;

    }

}