document.addEventListener("DOMContentLoaded", async () => {

    try {

        const res = await fetch("http://localhost:8080/api/farmer-orders", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        });

        const orders = await res.json();

        let totalEarnings = 0;
        let totalOrders = 0;
        let productsSold = 0;

        const recentOrders = document.getElementById("recentOrders");
        recentOrders.innerHTML = "";

        let deliveredFound = false;
        orders.forEach(order => {

            if (order.status === "Delivered") {
                deliveredFound = true;
                totalOrders++;
                totalEarnings += order.totalAmount;

                order.items.forEach(item => {
                    productsSold += item.quantity;
                });

                recentOrders.innerHTML += `
                    <tr>
                        <td>${order.buyer.name}</td>
                        <td>${order.items.map(i => i.product.name).join(", ")}</td>
                        <td>₹${order.totalAmount}</td>
                        <td>
                        <span class="badge bg-success">
                        ${order.status}
                        </span>
                        </td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                `;
            }

        });

        if (!deliveredFound) {

        recentOrders.innerHTML = `
             <tr>
               <td colspan="5" class="text-center">
                  No Delivered Orders Yet
               </td>
             </tr>
           `;

        }

        document.getElementById("totalEarnings").innerText = `₹${totalEarnings}`;
        document.getElementById("totalOrders").innerText = totalOrders;
        document.getElementById("productsSold").innerText = productsSold;

    } catch (err) {
        console.error(err);
    }

});