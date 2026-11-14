const table = document.getElementById("inventoryTable");
const token = localStorage.getItem("token");

loadProducts();

async function loadProducts() {

    const res = await fetch("http://localhost:8080/api/retailer-inventory", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const products = await res.json();

    table.innerHTML = "";

    products.forEach(product => {

        table.innerHTML += `

        <tr>

            <td>${product.name}</td>

            <td>₹${product.price}</td>

            <td>

                <input
                    type="number"
                    value="${product.quantity}"
                    min="0"
                    class="form-control quantityInput"
                    id="${product._id}"
                >

            </td>

            <td>

                ${
                    product.quantity > 0
                    ? '<span class="badge bg-success">In Stock</span>'
                    : '<span class="badge bg-danger">Out of Stock</span>'
                }

            </td>

            <td>

                <button
                    class="btn btn-primary"
                    onclick="updateStock('${product._id}')"
                >
                    Update
                </button>

            </td>

        </tr>

        `;

    });

}

async function updateStock(id) {

    const quantity = document.getElementById(id).value;

    const res = await fetch(`http://localhost:8080/api/retailer-inventory/${id}`, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`

        },

        body: JSON.stringify({

            quantity

        })

    });

    const data = await res.json();

    alert(data.message);

    loadProducts();

}
