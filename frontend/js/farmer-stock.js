const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}

if (user.role !== "farmer") {
    alert("Access Denied");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("http://localhost:8080/api/my-products", {
    headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
    }
 });

    const products = await res.json();

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    document.getElementById("totalProducts").innerText = products.length;

    const table = document.getElementById("stockTable");
    table.innerHTML = "";

    products.forEach(product => {

        let status = "";

        if (product.quantity == 0) {
            status = `<span class="badge bg-danger">Out Of Stock</span>`;
            outOfStock++;
        }

        else if (product.quantity <= 5) {
            status = `<span class="badge bg-warning text-dark">Low Stock</span>`;
            lowStock++;
        }

        else {
            status = `<span class="badge bg-success">In Stock</span>`;
            inStock++;
        }

        table.innerHTML += `
        <tr>

            <td>${product.name}</td>

            <td>${product.category}</td>

            <td>${product.quantity}</td>

            <td>${status}</td>

            <td>

                <button
                    class="btn btn-primary btn-sm"
                    onclick="updateStock('${product._id}', ${product.quantity})">

                    Update

                </button>

            </td>

        </tr>
        `;

    });

    document.getElementById("inStock").innerText = inStock;
    document.getElementById("lowStock").innerText = lowStock;
    document.getElementById("outOfStock").innerText = outOfStock;

});

async function updateStock(id, currentStock){

    const newStock = prompt("Enter New Stock", currentStock);

    if(newStock == null){
        return;
    }

    const res = await fetch(`http://localhost:8080/api/update-stock/${id}`,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer " + localStorage.getItem("token")
        },

        body:JSON.stringify({
            quantity:Number(newStock)
        })

    });

    const data = await res.json();

    alert(data.message);

    location.reload();

}