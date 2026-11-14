console.log("Retailer Orders JS Loaded");
const token = localStorage.getItem("token");
let allOrders = [];

async function loadOrders() {

    try {

        const res = await fetch(
            "http://localhost:8080/api/retailer-orders",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log("Status:", res.status);
        const orders = await res.json();
        allOrders = orders;
        console.log("Orders:", orders);

        const table = document.getElementById("ordersTable");

        table.innerHTML = "";

        orders.forEach(order => {

            table.innerHTML += `

            <tr>

                <td>${order.buyer.name}</td>

                <td>${order.items[0].product.name}</td>

                <td>${order.items[0].quantity}</td>

                <td>₹${order.totalAmount}</td>
                <td>
                <span class="badge ${
                    order.status==="Pending"
                    ? "bg-warning text-dark"
                    : order.status==="Confirmed"
                    ? "bg-success"
                    : "bg-danger"
                }">
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

    await fetch(

        `http://localhost:8080/api/orders/${id}/status`,

        {

            method:"PUT",

            headers:{

                "Content-Type":"application/json",

                Authorization:`Bearer ${token}`

            },

            body:JSON.stringify({status})

        }

    );

    loadOrders();

}

function openPackagingModal(orderId){

    document.getElementById("packagingOrderId").value = orderId;

    document.getElementById("packagingType").value = "";

    new bootstrap.Modal(
        document.getElementById("packagingModal")
    ).show();

}

async function savePackaging(){

    const orderId = document.getElementById("packagingOrderId").value;

    const type = document.getElementById("packagingType").value;

    if(!type){
        alert("Please select packaging type");
        return;
    }

    try{

        const res = await fetch(
            `http://localhost:8080/api/orders/${orderId}/packaging`,
            {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },
                body:JSON.stringify({
                    packagingType:type
                })
            }
        );

        const data = await res.json();

        alert(data.message);

        bootstrap.Modal.getInstance(
            document.getElementById("packagingModal")
        ).hide();

        loadOrders();

    }catch(err){

        console.log(err);
        alert("Packaging save failed");

    }

}