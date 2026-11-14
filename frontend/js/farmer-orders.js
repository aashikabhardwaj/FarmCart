const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

if (user.role !== "farmer") {
  alert("Access Denied");
  window.location.href = "index.html";
}

const token = localStorage.getItem("token");
let allOrders = [];
async function loadOrders() {

    try {

        const res = await fetch(
            "http://localhost:8080/api/farmer-orders",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const orders = await res.json();
        allOrders = orders;
        console.log("Orders Loaded:", allOrders);

        const tbody = document.getElementById("ordersTableBody");

        tbody.innerHTML = "";

        orders.forEach(order => {

            tbody.innerHTML += `
            <tr>

            <td>${order.buyer.name}</td>

            <td>${order.items[0].product.name}</td>

            <td>${order.items[0].quantity}</td>

            <td>₹${order.totalAmount}</td>

            
            <td>
                <span class="badge bg-warning">
                ${order.status}
                </span>
            </td>

            <td>

               ${order.status === "Pending" ? `

               <button
               class="btn btn-success btn-sm"
               onclick="updateStatus('${order._id}','Confirmed')">
               Accept
              </button>

              <button
              class="btn btn-danger btn-sm"
              onclick="updateStatus('${order._id}','Cancelled')">
              Reject
              </button>

              ` : ""}


             ${order.status === "Confirmed" ? `

             <button
             class="btn btn-primary btn-sm"
             onclick="updateStatus('${order._id}','Delivered')">
             Delivered
             </button>

             ${
             !order.packagingType
             ?
             `
             <button
             class="btn btn-warning btn-sm"
             onclick="openPackagingModal('${order._id}')">
             Packaging
             </button>
             `
             :
             `
             <span class="badge bg-info text-dark">
             Packaging : ${order.packagingType}
             </span>
             `
            }

            ` : ""}


            ${order.status === "Delivered" ? `

            ${
            !order.packagingType
            ?
            `
            <button
            class="btn btn-warning btn-sm"
            onclick="openPackagingModal('${order._id}')">
            Packaging
            </button>
            `
            :
            `
            <span class="badge bg-success">
            Packaging : ${order.packagingType}
            </span>
            `
            }

            ` : ""}


         ${order.status === "Cancelled" ? `

         <span class="badge bg-danger">
         Cancelled
         </span>

         ` : ""}

         </td>


            </tr>
            `;

        });

    }

    catch(err){

        console.log(err);

    }

}

loadOrders();

async function updateStatus(id,status){
    if (status === "Delivered") {
    console.log("Clicked ID:", id);
    console.log("All Orders:", allOrders);
    console.log("Order IDs:", allOrders.map(o => o._id));
    const currentOrder = allOrders.find(order => order._id === id);

    if (!currentOrder) {
        alert("Order not found");
        return;
    }

    if (!currentOrder.packagingType) {
        alert("Please select packaging before delivering the order.");
        return;
    }

    }
    try{

        await fetch(
            `http://localhost:8080/api/orders/${id}/status`,
            {
                method:"PUT",

                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },

                body:JSON.stringify({
                    status
                })
            }
        );

        loadOrders();
           if (status === "Delivered") {
             alert(
               "Order delivered successfully!\n\n" +
               "Please update your product stock by reducing the sold quantity."
              );
            }

    }

    catch(err){

        console.log(err);

    }

}

function openPackagingModal(orderId){

    document.getElementById("packagingOrderId").value =
    orderId;

    document.getElementById("packagingType").value = "";

    new bootstrap.Modal(
        document.getElementById("packagingModal")
    ).show();

}

async function savePackaging(){

    let orderId = document.getElementById("packagingOrderId").value;

    let type = document.getElementById("packagingType").value;

    if(!type){
        alert("Please select packaging type");
        return;
    }

    try{

        const res = await fetch(
            `http://localhost:8080/api/orders/${orderId}/packaging`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    packagingType: type
                })
            }
        );

        const data = await res.json();

        alert(data.message);

        let modal = bootstrap.Modal.getInstance(
            document.getElementById("packagingModal")
        );

        modal.hide();

        loadOrders();

    }
    catch(err){

        console.log(err);

        alert("Packaging save failed");

    }

}