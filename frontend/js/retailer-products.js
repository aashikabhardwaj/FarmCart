const container = document.getElementById("productsContainer");

let allProducts = [];

async function loadProducts() {

    try {

        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/my-eco-products", {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const products = await res.json();

        allProducts = products;

        displayProducts(products);

    }

    catch (err) {

        console.log(err);

    }

}

async function deleteProduct(id) {

    if (!confirm("Delete this product?")) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8080/api/products/${id}`, {

        method: "DELETE",

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    const data = await res.json();

    alert(data.message);

    loadProducts();

}

function editProduct(id) {

    window.location.href = `edit-product.html?id=${id}`;

}

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", () => {

    const keyword = searchInput.value.toLowerCase();

    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(keyword)
    );

    displayProducts(filteredProducts);

});

function displayProducts(products) {

    container.innerHTML = "";

    if(products.length === 0){

        container.innerHTML = `
            <h4 class="text-center mt-5">
                No Eco Products Found
            </h4>
        `;

        return;

    }

    products.forEach(product=>{

        container.innerHTML += `

        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">

            <div class="card product-card  h-100">
                <a href="pdetail.html?id=${product._id}">
                 <img
                    src="${product.image}"
                    alt="${product.name}"
                    style="cursor: pointer;">
                </a>

                <div class="product-body">

                    <span class="eco-badge">
                        🌿 Eco Friendly
                    </span>

                    <h4 class="product-name mt-3">
                        ${product.name}
                    </h4>

                    <p class="product-price">
                        ₹${product.price}
                    </p>

                    <p class="stock">

                        Quantity :
                        <b>${product.quantity}</b>

                    </p>

                    <div class="action-btns">

                        <button
                        class="btn btn-warning edit-btn"
                        onclick="editProduct('${product._id}')">

                        <i class="fa-solid fa-pen"></i>

                        Edit

                        </button>

                        <button
                        class="btn btn-danger delete-btn"
                        onclick="deleteProduct('${product._id}')">


                        <i class="fa-solid fa-trash"></i>

                        Delete

                        </button>

                    </div>

                </div>

            </div>

        </div>

        `;

    });

}

loadProducts();