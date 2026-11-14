

//document.addEventListener("DOMContentLoaded", async () => {
  //const grid = document.getElementById("ecoGrid");
  //const searchInput = document.getElementById("searchInput");
  //const categoryFilter = document.getElementById("categoryFilter");
  //let allProducts = [];

  //try {
   // const res = await fetch("http://localhost:8080/api/products");
   // const products = await res.json();
    //console.log("Products Response:", products);

    // Initially show only Ecofriendly products
    //allProducts = products;
    //filterProducts();

  //} catch (err) {
   // grid.innerHTML = "<p class='text-danger'>Products could not be loaded.</p>";
    //console.error("Fetch error:", err);
  //}

  //function displayProducts(products) {
    //grid.innerHTML = "";
    //products.forEach(product => {
      //const card = document.createElement("div");
      //card.className = "col-md-3 mb-4";
      //card.innerHTML = `
        //<div class="card product-card">
          //<img src="${product.image ? 'http://localhost:8080/' + product.image : 'https://via.placeholder.com/200x150?text=No+Image'}"
             //  class="card-img-top"
           //    alt="${product.name}">
         // <div class="card-body">
         //   <h5 class="card-title">${product.name}</h5>
        //    <p class="card-text">Price: ₹${product.price}</p>
      //    </div>
    //    </div>`;
      
          // card.addEventListener("click", () => {
          //   window.location.href = `pdetail.html?id=${product._id}`;
        //  });
      //grid.appendChild(card);
    //});
  //}

//function filterProducts() {
  //const searchText = searchInput.value.toLowerCase();
  //const category = categoryFilter.value; // "Others" by default

  //const filtered = allProducts.filter(p => {
    // Category logic: sirf "Others" category wale products
    //const matchCategory = p.category === "Others";

    // Search logic
    //const matchSearch = p.name.toLowerCase().includes(searchText);

    //return matchCategory && matchSearch;
  //});

  //displayProducts(filtered);
//}
  //searchInput.addEventListener("input", filterProducts);
  //categoryFilter.addEventListener("change", filterProducts);

  // Set default category on page load
  //if (categoryFilter) categoryFilter.value = "eco";
//);

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("ecoGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  let allProducts = [];
  const params = new URLSearchParams(window.location.search);
  const sellerId = params.get("seller");

  let url = "http://localhost:8080/api/products";

  if (sellerId) {
    url += `?seller=${sellerId}`;
   }

  try {
    const res = await fetch(url);
    const products = await res.json();

    console.log("Products Response:", products);

    allProducts = products;
    filterProducts();

  } catch (err) {
    console.error("Fetch error:", err);

    if (grid) {
      grid.innerHTML =
        "<p class='text-danger'>Products could not be loaded.</p>";
    }
  }

  function displayProducts(products) {
    grid.innerHTML = "";

    products.forEach(product => {
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
    const searchText = searchInput.value.toLowerCase();

    const filtered = allProducts.filter(product => {
      const matchCategory = product.category === "Others";
      const matchSearch = product.name
        .toLowerCase()
        .includes(searchText);

      return matchCategory && matchSearch;
    });

    displayProducts(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts);
    categoryFilter.value = "eco";
  }
});