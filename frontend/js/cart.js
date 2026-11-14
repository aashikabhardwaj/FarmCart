document.addEventListener("DOMContentLoaded", async () => {
  const cartGrid = document.getElementById("cartGrid");
  const totalPriceEl = document.getElementById("totalPrice");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // get JWT token from localStorage (from login)
  const token = localStorage.getItem("token");

  if (!token) {
    cartGrid.innerHTML = "<p>Please login to see your cart.</p>";
    totalPriceEl.textContent = 0;
    return;
  }

  try {
    // Fetch cart
    const res = await fetch("http://localhost:8080/api/cart", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cart = await res.json();
    console.log("Cart response from backend:", cart);


    if (!cart.items || cart.items.length === 0) {
      cartGrid.innerHTML = "<p>Your cart is empty!</p>";
      totalPriceEl.textContent = 0;
      return;
    }

    let totalPrice = 0;

    cartGrid.innerHTML = cart.items.map(item => {
      const product = item.product;
      totalPrice += product.price * item.quantity;
      return `
        <div class="cart-card" data-id="${product._id}">
          <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>Price: ₹${product.price}</p>
          <p>Quantity: ${item.quantity}</p>
          <button class="remove-btn" data-id="${product._id}">Remove</button>
        </div>
      `;
    }).join('');

    totalPriceEl.textContent = totalPrice;

    // Remove button
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const productId = btn.dataset.id;
        try {
          const res = await fetch(`http://localhost:8080/cart/remove/${productId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          const updatedCart = await res.json();

          btn.parentElement.remove();
          totalPriceEl.textContent = updatedCart.totalPrice || 0;
        } catch (err) {
          console.error("Failed to remove item:", err);
        }
      });
    });

    // Checkout button
    checkoutBtn.addEventListener("click", () => {
      if (!cart.items.length) return alert("Your cart is empty!");
      alert(`Proceeding to checkout. Total: ₹${totalPrice}`);
      // window.location.href = "/checkout.html";
    });

  } catch (err) {
    console.error("Error fetching cart:", err);
    cartGrid.innerHTML = "<p>Failed to load cart items.</p>";
    totalPriceEl.textContent = 0;
  }
});
