
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  console.log("Attempting login:", { email, password });

  try {

    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log("Login response from backend:", data);

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    alert("Login successful!");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    if (data.role === "farmer") {
      window.location.href = "/farmer-dashboard.html";
    } else if (data.role === "retailer") {
      window.location.href = "/retailer-dashboard.html";
    } else if (data.role === "customer") {
      window.location.href = "/customer-dashboard.html";
    }else if (data.role === "admin") {
      window.location.href = "/admin-dashboard.html";
    } else {
      window.location.href = "/index.html";
  }

  } catch (err) {

    console.error("Login error:", err);
    alert("Error: " + err.message);

  }

});