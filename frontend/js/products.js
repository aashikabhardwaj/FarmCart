const isFarmersPage =
    window.location.pathname.includes("farmers.html");

document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("gridContainer");
  const categoryFilter = document.getElementById("categoryFilter");
  const ecoFilter = document.getElementById("ecoFilter");
  const searchInput = document.getElementById("searchInput");

  let allProducts = [];
  // Agar backend port 8080 pe hai:
  let url;

if (isFarmersPage) {

    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get("seller");

    url = "http://localhost:8080/api/farmer-products";

    if (sellerId) {
        url += `?seller=${sellerId}`;
    }

} else {

    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get("seller");

    url = "http://localhost:8080/api/products";

    if (sellerId) {
        url += `?seller=${sellerId}`;
    }

}

fetch(url)
.then(res => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
})
.then(products => {
    allProducts = products;
    displayProducts(products);
})
.catch(err => {
    grid.innerHTML =
        "<p class='text-danger'>Products could not be loaded.</p>";
    console.error(err);
});
  //new display
  function displayProducts(products) {
  const grid = document.getElementById("gridContainer");
  grid.innerHTML = "";

  products.forEach(product => {
    console.log(product);
    

    const card = document.createElement("div");
    card.className = "col-md-3 mb-4";

    card.innerHTML = `
     <div class="card product-card ${product.quantity <= 0 ? "out-of-stock" : ""}">
     <img
       src="${
         product.image
           ? "http://localhost:8080/" + product.image
           : "https://via.placeholder.com/200x150?text=No+Image"
       }"
    class="card-img-top"
    alt="${product.name}"
    >

    <div class="card-body">
     <h5 class="card-title">${product.name}</h5>
     <p class="card-text">Price: ₹${product.price}</p>

     <p class="${product.quantity > 0 ? "text-success" : "text-danger"}">
       ${product.quantity > 0 ? "Available" : "Out of Stock"}
     </p>
    </div>
  </div>
 `;

   card.addEventListener("click", () => {

    if (product.quantity <= 0) {
        alert("This product is out of stock");
        return;
    }

    window.location.href = `pdetail.html?id=${product._id}`;
   });
    grid.appendChild(card);
  });
}

  

  function filterProducts() {
    let filtered = [...allProducts];

    if (categoryFilter && categoryFilter.value) {
      filtered = filtered.filter(p => p.category === categoryFilter.value);
    }

    if (ecoFilter && ecoFilter.checked) {
      // we assume eco products are saved as category: "EcoFriendly"
      filtered = filtered.filter(p => p.category === "EcoFriendly" || p.ecoFriendly === true);
    }

    const searchTerm = (searchInput && searchInput.value || "").toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(p => (p.name || "").toLowerCase().includes(searchTerm));
    }

    displayProducts(filtered);
  }

  [categoryFilter, ecoFilter, searchInput].forEach(el => {
    if (!el) return;
    el.addEventListener("input", filterProducts);
  });
});

// Safe AddToCart that mimics a normal form POST so old backend redirect flow stays same
function addToCart(productId) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `/cart/add/${productId}`;

  const qty = document.createElement("input");
  qty.type = "hidden";
  qty.name = "quantity";
  qty.value = "1";
  form.appendChild(qty);

  // ✅ Click event for redirect to details page
  //card.addEventListener("click", () => {
    //window.location.href = `pdetail.html?id=${p._id}&type=farmer`;
  //});
  document.body.appendChild(form);
  form.submit();
}
