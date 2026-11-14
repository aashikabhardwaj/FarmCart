// =========================
// Authentication
// =========================

const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user"));


if(!token || !user){

    window.location.href="login.html";

}


if(user.role !== "admin"){

    alert("Access Denied");

    window.location.href="index.html";

}



// =========================
// Logout
// =========================

function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href="login.html";

}




// =========================
// Load Selected Order
// =========================


const orderId = localStorage.getItem("selectedOrder");



async function loadOrder(){


try{


const res = await fetch(

`http://localhost:8080/api/admin/orders/${orderId}`,

{

headers:{

Authorization:"Bearer "+token

}

}

);



const order = await res.json();



console.log(order);



displayOrder(order);



}

catch(err){

console.log(err);

}


}





// =========================
// Display Details
// =========================

function displayOrder(order){

const div = document.getElementById("orderDetails");


div.innerHTML = `


<div class="card shadow-sm mb-4">

    <div class="card-header d-flex justify-content-between align-items-center">

        <h5 class="mb-0">
            Order #${order._id.slice(0,8)}
        </h5>


        <span class="badge 
        ${order.status === "Pending" ? "bg-warning text-dark" :
        order.status === "Confirmed" ? "bg-info" :
        order.status === "Delivered" ? "bg-success" :
        "bg-secondary"}">

            ${order.status}

        </span>


    </div>



    <div class="card-body">



        <!-- Customer Information -->

        <div class="mb-4">

            <h5 class="border-bottom pb-2">
                Customer Information
            </h5>


            <div class="row">

                <div class="col-md-6">

                    <p>
                    <strong>Name:</strong>
                    ${order.buyer?.name || "N/A"}
                    </p>

                </div>


                <div class="col-md-6">

                    <p>
                    <strong>Email:</strong>
                    ${order.buyer?.email || "N/A"}
                    </p>

                </div>


            </div>


        </div>





        <!-- Products -->

        <div class="mb-4">


            <h5 class="border-bottom pb-2">
                Products
            </h5>


            <div class="list-group">


            ${
                order.items.map(item=>`

                <div class="list-group-item d-flex justify-content-between">

                    <span>
                    ${item.product?.name || "Product"}
                    </span>


                    <span>
                    Qty: ${item.quantity}
                    </span>


                </div>


                `).join("")
            }


            </div>


        </div>





        <!-- Payment Summary -->

        <div class="mb-4">


            <h5 class="border-bottom pb-2">
                Payment Summary
            </h5>


            <h4 class="text-success">

                ₹${order.totalAmount}

            </h4>


        </div>





        <!-- Action Buttons -->

        <div class="d-flex gap-2">


        <button 
        onclick="updateStatus('Confirmed')"
        class="btn btn-success">

        Confirm

        </button>


        <button 
        onclick="updateStatus('Shipped')"
        class="btn btn-primary">

        Ship

        </button>


        <button 
        onclick="updateStatus('Delivered')"
        class="btn btn-dark">

        Deliver

        </button>


        </div>



    </div>

</div>


`;

}

async function updateStatus(status){


try{


const res = await fetch(

`http://localhost:8080/api/orders/${orderId}/status`,

{

method:"PUT",

headers:{


"Content-Type":"application/json",

Authorization:"Bearer "+token


},


body: JSON.stringify({

status:status

})


}

);



const updatedOrder = await res.json();



console.log(updatedOrder);



alert("Order status updated");


// refresh details

displayOrder(updatedOrder);



}


catch(err){

console.log(err);

alert("Status update failed");

}


}

loadOrder();