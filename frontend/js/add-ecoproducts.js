const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

if (user.role !== "retailer") {
  alert("Access Denied");
  window.location.href = "index.html";
}

const form = document.getElementById("productForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("name", document.getElementById("name").value);

    formData.append("price", document.getElementById("price").value);

    formData.append("quantity", document.getElementById("quantity").value);

    formData.append(
        "description",
        document.getElementById("description").value
    );

    formData.append(
        "image",
        document.getElementById("image").files[0]
    );

    // Eco product
formData.append("ecoFriendly", true);

try {

    const response = await fetch(
        "http://localhost:8080/api/products",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        }
    );

    const data = await response.json();

    if (response.ok) {
        alert("Eco Product Added Successfully");
        window.location.href = "retailer-products.html";
    } else {
        alert(data.message || "Failed to add product");
    }

} catch (err) {

    console.log(err);

    alert("Error adding eco product");
}
});
