const roleSelect = document.getElementById("role");

roleSelect.addEventListener("change", () => {

    const adminBox = document.getElementById("adminBox");

    if(roleSelect.value === "admin"){

        adminBox.style.display = "block";

    }

    else{

        adminBox.style.display = "none";

    }

});

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const adminCode = document.getElementById("adminCode").value;
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
       name,
       email,
       password,
       phone,
       address,
       role,
       adminCode
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message||"Signup failed");

    alert("Signup successful! Please login.");
    window.location.href = "login.html"; // redirect after signup
  } catch (err) {
    alert("Error: " + err.message);
  }
});
