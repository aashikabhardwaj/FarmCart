function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href="login.html";

}

const user = JSON.parse(localStorage.getItem("user"));

if(!user){

    window.location.href="login.html";

}

if(user.role !== "retailer"){

    alert("Access Denied");

    window.location.href="index.html";

}

document.getElementById("welcomeText").innerText =
`Welcome, ${user.name}`;

async function loadEcoProductsCount(){

    try{

        const res = await fetch("http://localhost:8080/api/my-eco-products",{
            headers:{
                "Authorization":"Bearer " + localStorage.getItem("token")
            }
        });


        const products = await res.json();

        console.log("Eco Products:", products);


        document.getElementById("totalProducts").innerText = products.length;


    }
    catch(err){

        console.log("Eco Products Error:", err);

    }

}

async function loadRetailerStats(){

    try{

        const res = await fetch("http://localhost:8080/api/retailer-earnings", {
            headers:{
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        const data = await res.json();

        console.log("Retailer Earnings:", data);


        document.getElementById("totalOrders").innerText = data.totalOrders;

        document.getElementById("totalRevenue").innerText = 
        "₹" + data.totalRevenue;


    }
    catch(err){

        console.log("Error loading earnings:", err);

    }

}


async function loadRecentOrders(){

    try{

        const res = await fetch("http://localhost:8080/api/retailer-orders",{
            headers:{
                "Authorization":"Bearer " + localStorage.getItem("token")
            }
        });


        const orders = await res.json();

        console.log("Recent Orders:", orders);


        const tbody = document.getElementById("recentOrders");

        tbody.innerHTML = "";
        if (orders.length === 0) {

          tbody.innerHTML = `
         <tr>
            <td colspan="5" class="text-center text-muted py-4">
                <i class="fa-solid fa-box-open fa-2x mb-2"></i><br>
                No orders found.
            </td>
         </tr>
        `;
        return;
}


        orders.slice(0,5).forEach(order=>{


            let productName = "N/A";


            if(order.items && order.items.length > 0){

                productName = order.items[0].product?.name || 
                              order.items[0].name || 
                              "Product";

            }


            let statusClass = "bg-warning text-dark";


            if(order.status === "Confirmed"){
                statusClass = "bg-success";
            }

            else if(order.status === "Cancelled"){
                statusClass = "bg-danger";
            }

            else if(order.status === "Delivered"){
                statusClass = "bg-primary";
            }



            tbody.innerHTML += `

            <tr>

                <td>#${order._id.slice(-6)}</td>

                <td>${order.buyer?.name || "Customer"}</td>

                <td>${productName}</td>

                <td>₹${order.totalAmount}</td>

                <td>
                    <span class="badge ${statusClass}">
                        ${order.status}
                    </span>
                </td>

            </tr>

            `;


        });


    }

    catch(err){

        console.log("Recent Orders Error:",err);

    }

}

async function loadInventoryAlerts(){

    try{

        const res = await fetch("http://localhost:8080/api/retailer-inventory",{
            headers:{
                "Authorization":"Bearer " + localStorage.getItem("token")
            }
        });


        const products = await res.json();

        console.log("Inventory:", products);


        const alertBox = document.getElementById("inventoryAlerts");

        alertBox.innerHTML="";


        let lowStockCount = 0;


        products.forEach(product=>{


            if(product.quantity <= 5){

                lowStockCount++;


                if(product.quantity == 0){

                    alertBox.innerHTML += `
                    <li>
                        <span>${product.name}</span>
                        <strong class="text-danger">
                            Out of Stock
                        </strong>
                    </li>
                    `;

                }

                else{

                    alertBox.innerHTML += `
                    <li>
                        <span>${product.name}</span>
                        <strong class="text-warning">
                            Only ${product.quantity} Left
                        </strong>
                    </li>
                    `;

                }

            }


        });


        document.getElementById("lowStock").innerText = lowStockCount;
        if (lowStockCount === 0) {

          alertBox.innerHTML = `
           <li class="text-success text-center">
              <i class="fa-solid fa-circle-check"></i>
              All products are well stocked.
           </li>
         `;
        }


    }
    catch(err){

        console.log("Inventory Error:",err);

    }

}

async function loadBestSellingProducts(){

    try{

        const res = await fetch("http://localhost:8080/api/retailer-best-selling",{
            headers:{
                "Authorization":"Bearer " + localStorage.getItem("token")
            }
        });


        const products = await res.json();


        const box = document.getElementById("bestSellingProducts");


        box.innerHTML="";
        if (products.length === 0) {
       
           box.innerHTML = `
             <li class="text-muted text-center">
               No sales yet.
             </li>
           `;

        return;
    }


        products.forEach(product=>{


            box.innerHTML += `

            <li>
                <span>${product.name}</span>
                <strong>${product.sold} Sold</strong>
            </li>

            `;


        });


    }
    catch(err){

        console.log("Best Selling Error:",err);

    }

}

async function checkRestock() {

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:8080/api/retailer-restock",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const products = await response.json();

        const container = document.getElementById("restockSuggestions");

        container.innerHTML = "";

        if (products.length > 0) {

            products.forEach(product => {

                container.innerHTML += `

                <div class="restock-card">

                    <div class="restock-icon">
                        <i class="fa-solid fa-box"></i>
                    </div>

                    <div class="restock-info">

                        <h5>${product.name}</h5>

                        <p>
                            Only ${product.quantity} items left
                        </p>

                    </div>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="goToInventory('${product._id}')">
                        Restock
                    </button>

                </div>

                `;

            });

            // ---------------- Popup Logic ----------------

            const now = Date.now();
            const tenHours = 10 * 60 * 60 * 1000;

            const lastPopup =
                Number(localStorage.getItem("lastRestockPopup")) || 0;

            // Sirf IDs compare karenge (count nahi)
            const currentIds = products
                .map(p => p._id)
                .sort()
                .join(",");

            const lastIds =
                localStorage.getItem("lastLowStockIds") || "";

            const newProductAdded = currentIds !== lastIds;

            if (newProductAdded || (now - lastPopup) >= tenHours) {

                alert(`⚠️ ${products.length} products need restocking.`);

                localStorage.setItem("lastRestockPopup", now);
                localStorage.setItem("lastLowStockIds", currentIds);

            }

        } else {

            container.innerHTML = `
                <p class="text-success">
                    All products stock is good 🎉
                </p>
            `;

            // Low stock khatam ho gaya to reset
            localStorage.removeItem("lastLowStockIds");

        }

    } catch (err) {

        console.log("Restock Error:", err);

    }

}

async function loadPackagingRequests(){

    try{

        const res = await fetch(
            "http://localhost:8080/api/packaging/requests",
            {
                headers:{
                    Authorization:"Bearer " + localStorage.getItem("token")
                }
            }
        );

        const requests = await res.json();

        const pending = requests.filter(r => r.status === "Pending");

        document.getElementById("pendingReturns").innerText =
            pending.length;

    }

    catch(err){

        console.log("Packaging Error:", err);

    }

}

function goToInventory(productId){

    localStorage.setItem("restockProductId", productId);

    window.location.href = "retailer-inventory.html";

}

checkRestock();

loadEcoProductsCount();
loadRetailerStats();
loadRecentOrders();
loadInventoryAlerts();
loadBestSellingProducts();
loadPackagingRequests();