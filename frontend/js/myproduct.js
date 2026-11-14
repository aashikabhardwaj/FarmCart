//new
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

if (user.role !== "farmer") {
  alert("Access Denied");
  window.location.href = "index.html";
}

let allProducts = [];

document.addEventListener("DOMContentLoaded", async () => {

  const res = await fetch("http://localhost:8080/api/my-products", {
      headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
     }
  });
  allProducts = await res.json();

  displayProducts(allProducts);

  document.getElementById("searchInput").addEventListener("input", filterProducts);
  document.getElementById("categoryFilter").addEventListener("change", filterProducts);

});

function displayProducts(products) {

  const grid = document.getElementById("myProductsGrid");
  grid.innerHTML = "";

  if (products.length === 0) {
    grid.innerHTML = "<p>No products found</p>";
    return;
  }

  products.forEach(product => {

    grid.innerHTML += `
      <div class="col-md-3 mb-4">

        <div class="card product-card"
             onclick="window.location.href='pdetail.html?id=${product._id}'"
             style="cursor:pointer;">

          <img src="${
            product.image
              ? "http://localhost:8080/" + product.image.replace(/\\/g, "/")
              : "https://via.placeholder.com/200x150"
          }">

          <div class="card-body">

            <h5>${product.name}</h5>

            <p>₹${product.price}</p>

            <p>Qty : ${product.quantity}</p>

            <div class="d-flex gap-2 mt-3">

              <button class="btn btn-success btn-sm"
                onclick="event.stopPropagation(); editProduct('${product._id}')">
                Edit
              </button>

              <button class="btn btn-danger btn-sm"
                onclick="event.stopPropagation(); deleteProduct('${product._id}')">
                Delete
              </button>

            </div>

          </div>

        </div>

      </div>
    `;
  });
}

function filterProducts() {

  const search = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search) &&
    (category === "" || p.category === category)
  );

  displayProducts(filtered);
}


async function deleteProduct(id){

  if(!confirm("Are you sure you want to delete this product?")){
    return;
  }

  await fetch(`http://localhost:8080/products/${id}`, {
    method: "DELETE"
  });

  allProducts = allProducts.filter(p => p._id !== id);
  displayProducts(allProducts);
}

function editProduct(id) {
  window.location.href = `edit-product.html?id=${id}`;
}