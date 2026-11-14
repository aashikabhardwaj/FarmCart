// ================================
// Logout
// ================================

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}

// ================================
// Login Check
// ================================

const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user"));

if(!token || !user){

    window.location.href = "login.html";

}

if(user.role !== "admin"){

    alert("Access Denied");

    window.location.href = "index.html";

}

// ================================
// Welcome Text
// ================================

document.getElementById("welcomeText").innerText = user.name;

// ================================
// Dashboard Stats
// ================================

async function loadDashboardStats(){

    try{

        const res = await fetch(
            "http://localhost:8080/api/admin/dashboard",
            {
                headers:{
                    Authorization:"Bearer " + token
                }
            }
        );

        const data = await res.json();

        console.log("Dashboard Stats :", data);

        document.getElementById("totalUsers").innerText =
        data.totalUsers;

        document.getElementById("totalProducts").innerText =
        data.totalProducts;

        document.getElementById("totalOrders").innerText =
        data.totalOrders;

        document.getElementById("totalRevenue").innerText =
        "₹" + data.totalRevenue;

        document.getElementById("totalFarmers").innerText =
        data.totalFarmers;

        document.getElementById("totalRetailers").innerText =
        data.totalRetailers;

        document.getElementById("totalCustomers").innerText =
        data.totalCustomers;

    }

    catch(err){

        console.log("Dashboard Error :", err);

    }

}

// ================================
// Recent Users
// ================================

async function loadRecentUsers(){

    try{

        const res = await fetch(
            "http://localhost:8080/api/admin/recent-users",
            {
                headers:{
                    Authorization:"Bearer " + token
                }
            }
        );

        const users = await res.json();

        console.log("Recent Users:", users);

        const tbody = document.getElementById("recentUsers");

        tbody.innerHTML = "";

        users.forEach(user => {

            const date = new Date(user.createdAt)
            .toLocaleDateString();

            tbody.innerHTML += `

            <tr>

                <td>${user.name}</td>

                <td>${user.role}</td>

                <td>${date}</td>

            </tr>

            `;

        });

    }

    catch(err){

        console.log("Recent Users Error:", err);

    }

}

// ================================
// Recent Orders
// ================================

async function loadRecentOrders(){

    try{

        const res = await fetch(
            "http://localhost:8080/api/admin/recent-orders",
            {
                headers:{
                    Authorization:"Bearer " + token
                }
            }
        );

        const orders = await res.json();

        console.log("Recent Orders:", orders);

        const tbody = document.getElementById("recentOrders");

        tbody.innerHTML = "";

        orders.forEach(order => {

            let badge = "bg-warning text-dark";

            if(order.status === "Confirmed"){

                badge = "bg-success";

            }

            else if(order.status === "Delivered"){

                badge = "bg-primary";

            }

            else if(order.status === "Cancelled"){

                badge = "bg-danger";

            }

            tbody.innerHTML += `

            <tr>

                <td>#${order._id.slice(-6)}</td>

                <td>${order.buyer?.name || "Customer"}</td>

                <td>

                    <span class="badge ${badge}">

                        ${order.status}

                    </span>

                </td>

            </tr>

            `;

        });

    }

    catch(err){

        console.log("Recent Orders Error:", err);

    }

}

// ================================
// System Alerts
// ================================

async function loadSystemAlerts(){

    const alertBox = document.getElementById("systemAlerts");

    alertBox.innerHTML = "";

    try{

        const res = await fetch(
            "http://localhost:8080/api/admin/dashboard",
            {
                headers:{
                    Authorization:"Bearer " + token
                }
            }
        );

        const data = await res.json();

        if(data.totalOrders > 0){

            alertBox.innerHTML += `

            <li>

                <i class="fa-solid fa-cart-shopping text-primary"></i>

                ${data.totalOrders} total orders available.

            </li>

            `;

        }

        if(data.totalProducts > 0){

            alertBox.innerHTML += `

            <li>

                <i class="fa-solid fa-box text-success"></i>

                ${data.totalProducts} products listed.

            </li>

            `;

        }

        if(data.totalUsers > 0){

            alertBox.innerHTML += `

            <li>

                <i class="fa-solid fa-users text-warning"></i>

                ${data.totalUsers} registered users.

            </li>

            `;

        }

    }

    catch(err){

        console.log("System Alerts Error:", err);

    }

}

// ================================
// Load Dashboard
// ================================

loadDashboardStats();

loadRecentUsers();

loadRecentOrders();

loadSystemAlerts();