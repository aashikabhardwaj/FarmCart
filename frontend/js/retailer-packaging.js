const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {

    window.location.href = "login.html";

}

if (user.role !== "farmer" && user.role !== "retailer") {

    alert("Access Denied");

    window.location.href = "index.html";

}

loadPackagingRequests();

async function loadPackagingRequests(){

    try{

        const res = await fetch(

            "http://localhost:8080/api/packaging/requests",

            {

                headers:{

                    Authorization:"Bearer " + token

                }

            }

        );

        const requests = await res.json();

        console.log(requests);
        const pending = requests.filter(r => r.status === "Pending").length;

        const approved = requests.filter(r => r.status === "Approved").length;

        const rejected = requests.filter(r => r.status === "Rejected").length;

        const ecoSaved = approved;

        document.getElementById("pendingCount").innerText = pending;

        document.getElementById("approvedCount").innerText = approved;

        document.getElementById("rejectedCount").innerText = rejected;

        document.getElementById("ecoCount").innerText = ecoSaved;

        const table = document.getElementById("requestsTable");

          if(requests.length === 0){

             table.innerHTML = `
               <tr>
                  <td colspan="6" class="text-center">
                     No Packaging Requests Found
                  </td>
              </tr>
           `;

          return;
           }

        table.innerHTML = "";

        requests.forEach(r => {

           table.innerHTML += `

<tr>

<td>${r.customer?.name || "-"}</td>

<td>#${r.order.toString().slice(-5).toUpperCase()}</td>

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

<td>

<button
class="btn btn-success btn-sm"
onclick="openReview('${r._id}')">

${r.status === "Pending" ? "Review" : "View"}

</button>

</td>

</tr>

`;

});

    }

    catch(err){

        console.log(err);

    }

}

async function openReview(id){

    try{

        const res = await fetch(

            "http://localhost:8080/api/packaging/request/" + id,

            {
                headers:{
                    Authorization:"Bearer " + token
                }
            }

        );

        const request = await res.json();

        document.getElementById("requestId").value = request._id;

        document.getElementById("customerName").innerText =
        request.customer?.name || "-";

        document.getElementById("packagingType").innerText =
        request.packagingType;

        document.getElementById("packagingCondition").innerText =
        request.condition;

        document.getElementById("customerComment").innerText =
        request.customerComment || "No comment";

        if(request.customerImage){

    document.getElementById("customerImage").src =
    "http://localhost:8080/uploads/" + request.customerImage;

}
else{

    document.getElementById("customerImage").src =
    "https://via.placeholder.com/400x300?text=No+Image";

}

     const approveBtn = document.querySelector(
     "#reviewModal .btn-success"
     );

     const rejectBtn = document.querySelector(
     "#reviewModal .btn-danger"
     );

     if (request.status === "Pending") {

      approveBtn.style.display = "inline-block";
      rejectBtn.style.display = "inline-block";

     }
     else{

      approveBtn.style.display = "none";
      rejectBtn.style.display = "none";

     }

        new bootstrap.Modal(
            document.getElementById("reviewModal")
        ).show();

    }

    catch(err){

        console.log(err);

    }

}

async function approveRequest() {

    const id = document.getElementById("requestId").value;

    try {

        const res = await fetch(
            "http://localhost:8080/api/packaging/request/" + id,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({
                    status: "Approved"
                })
            }
        );

        const data = await res.json();

        alert(data.message);

        if (res.ok) {

            bootstrap.Modal.getInstance(
                document.getElementById("reviewModal")
            ).hide();

            loadPackagingRequests();
        }

    } catch (err) {

        console.log(err);
        alert("Something went wrong.");

    }

}

async function rejectRequest() {

    const id = document.getElementById("requestId").value;

    try {

        const res = await fetch(
            "http://localhost:8080/api/packaging/request/" + id,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({
                    status: "Rejected"
                })
            }
        );

        const data = await res.json();

        alert(data.message);

        if (res.ok) {

            bootstrap.Modal.getInstance(
                document.getElementById("reviewModal")
            ).hide();

            loadPackagingRequests();
        }

    } catch (err) {

        console.log(err);
        alert("Something went wrong.");

    }

}