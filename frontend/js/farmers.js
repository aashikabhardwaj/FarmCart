
document.addEventListener("DOMContentLoaded", async () => {

  //const grid = document.getElementById("farmersGrid");
  const grid = document.getElementById("gridContainer");

  if (!grid) {
    console.log("Farmers page not loaded");
    return;
  }

  try {

    const params = new URLSearchParams(window.location.search);
const sellerId = params.get("seller");

let url = "http://localhost:8080/api/farmer-products";

if (sellerId) {
    url += `?seller=${sellerId}`;
}

const res = await fetch(url);
const products = await res.json();

console.log("Seller Filter:", sellerId);
console.log(products);
   // const res = await fetch("http://localhost:8080/api/farmer-products");
    //const products = await res.json();
    

    grid.innerHTML = products.map(p => {
      return `
        
        <div class="product-card ${p.quantity > 0 ? '' : 'out-of-stock'}"
         data-id="${p._id}"
        
         data-available="${p.quantity > 0}">
          <img src="${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
          <p class="${p.quantity > 0 ? 'text-success' : 'text-danger'}">
          ${p.quantity > 0 ? "Available" : "Out of Stock"}
          </p>
         
        </div>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p class='text-danger'>Products could not be loaded.</p>";
  }

  // CLICK HANDLER
grid.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const id = card.getAttribute("data-id");
    const isAvailable = card.getAttribute("data-available");

    if (!id || id === "null") {
        return;
    }

    //  OUT OF STOCK CHECK (SAFE ADDITION)
    if (isAvailable === "false") {
        alert("This product is out of stock");
        return; // stop redirect
    }

    window.location.href = `products.html?id=${id}`;
});

});

