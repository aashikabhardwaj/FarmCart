const token = localStorage.getItem("token");

async function loadPackagingRequests() {

    try {

        const res = await fetch(
            "http://localhost:8080/api/admin/packaging",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();
        const requests = data.requests;

        console.log("Packaging Requests:", requests);

        document.getElementById("totalRequests").innerText =
            requests.length;

        document.getElementById("pendingRequests").innerText =
            requests.filter(r => r.status === "Pending").length;

        document.getElementById("approvedRequests").innerText =
            requests.filter(r => r.status === "Approved").length;

        document.getElementById("rejectedRequests").innerText =
            requests.filter(r => r.status === "Rejected").length;

        document.getElementById("totalRewardPoints").innerText =
            data.totalRewardPoints;

        document.getElementById("farmerRewards").innerText =
            data.farmerRewards;

        document.getElementById("retailerRewards").innerText =
            data.retailerRewards;

        document.getElementById("walletBalance").innerText =
            data.totalWalletBalance;

        const table = document.getElementById("requestsTable");

        table.innerHTML = "";

        if (requests.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        No Packaging Requests Found
                    </td>
                </tr>
            `;

            return;
        }

        requests.forEach(r => {

            table.innerHTML += `

            <tr>

                <td>${r.customer?.name || "-"}</td>

                <td>${r.seller?.name || "-"}</td>

                <td>${r.seller?.role || "-"}</td>

                <td>${r.packagingType}</td>

                <td>${r.condition}</td>

                <td>

                    <span class="badge ${
                        r.status === "Approved"
                        ? "bg-success"
                        : r.status === "Rejected"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }">

                    ${r.status}

                    </span>

                </td>

                <td>${r.rewardPoints}</td>

            </tr>

            `;

        });

    }

    catch(err){

        console.log(err);

    }

}

loadPackagingRequests();