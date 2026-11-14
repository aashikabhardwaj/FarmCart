
function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href="login.html";

}

const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user"));

if(!token || !user){

    window.location.href="login.html";

}

if(user.role !== "admin"){

    alert("Access Denied");

    window.location.href="index.html";

}


let allOrders = [];

async function loadOrders(){

    try{

        const res = await fetch(

            "http://localhost:8080/api/admin/orders",

            {

                headers:{

                    Authorization:"Bearer " + token

                }

            }

        );

        const orders = await res.json();

        console.log(orders);

        allOrders = orders;

        updateCards(orders);

        displayOrders(orders);

    }

    catch(err){

        console.log(err);

    }

}

function updateCards(orders){

    document.getElementById("totalOrders").innerText =
    orders.length;


    document.getElementById("pendingOrders").innerText =

    orders.filter(

        order=>order.status==="Pending"

    ).length;


    document.getElementById("confirmedOrders").innerText =

    orders.filter(

        order=>order.status==="Confirmed"

    ).length;


    document.getElementById("shippedOrders").innerText =

    orders.filter(

        order=>order.status==="Shipped"

    ).length;

}


function displayOrders(orders){

    const table = document.getElementById("ordersTable");

    table.innerHTML = "";


    if(orders.length === 0){

        table.innerHTML = `

        <tr>

        <td colspan="7" class="text-center">

        No Orders Found

        </td>

        </tr>

        `;

        return;

    }



    orders.forEach(order=>{


        const row = document.createElement("tr");


        row.innerHTML = `


        <td>

        ${order._id.substring(0,8)}...

        </td>



        <td>

        ${order.buyer?.name || "N/A"}

        </td>



        <td>

        ${order.farmer?.name || order.retailer?.name || "N/A"}

        </td>



        <td>

        ₹${order.totalAmount || 0}

        </td>



        <td>

        <span class="badge 
        ${getStatusClass(order.status)}">

        ${order.status}

        </span>

        </td>



        <td>

        ${new Date(order.createdAt)
        .toLocaleDateString()}

        </td>



        <td>

        <button 
        class="btn btn-primary btn-sm btn-view"
        onclick="viewOrder('${order._id}')">

        View

        </button>

        </td>


        `;


        table.appendChild(row);


    });


}

function getStatusClass(status){


    if(status==="Pending"){

        return "bg-warning text-dark";

    }


    if(status==="Confirmed"){

        return "bg-info";

    }


    if(status==="Shipped"){

        return "bg-primary";

    }


    if(status==="Delivered"){

        return "bg-success";

    }


    if(status==="Cancelled"){

        return "bg-danger";

    }


    return "bg-secondary";


}

document
.getElementById("searchOrder")
.addEventListener("input",function(){


    const value=this.value.toLowerCase();


    const filtered = allOrders.filter(order=>{


        return (

            order._id.toLowerCase()
            .includes(value)

            ||

            order.buyer?.name
            ?.toLowerCase()
            .includes(value)

        );


    });


    displayOrders(filtered);


});

document
.getElementById("statusFilter")
.addEventListener("change",function(){


    const status=this.value;


    if(status==="all"){

        displayOrders(allOrders);

        return;

    }



    const filtered = allOrders.filter(order=>

        order.status===status

    );


    displayOrders(filtered);


});

function viewOrder(id){


    localStorage.setItem(
        "selectedOrder",
        id
    );


    window.location.href =
    "admin-order-detail.html";


}

loadOrders();