// =========================
// Login Check
// =========================

const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {

    window.location.href = "login.html";

}

if (user.role !== "admin") {

    alert("Access Denied");

    window.location.href = "index.html";

}



// =========================
// Logout
// =========================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "login.html";

}



// =========================
// Load Profile
// =========================

function loadProfile() {

    document.getElementById("adminName").innerText =
    user.name || "Admin";

    document.getElementById("adminEmail").innerText =
    user.email || "N/A";

    document.getElementById("adminRole").innerText =
    user.role;

    document.getElementById("profileName").innerText =
    user.name || "Admin";

    document.getElementById("profileEmail").innerText =
    user.email || "N/A";

    document.getElementById("profileRole").innerText =
    user.role;

    if (user.createdAt) {

        document.getElementById("joinedDate").innerText =
        new Date(user.createdAt).toLocaleDateString();

    }
    else {

        document.getElementById("joinedDate").innerText =
        "Not Available";

    }

}



// =========================
// Dashboard Statistics
// =========================

async function loadStats() {

    try {

        const res = await fetch(
            "http://localhost:8080/api/admin/dashboard",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const data = await res.json();

        document.getElementById("totalUsers").innerText =
        data.totalUsers;

        document.getElementById("totalProducts").innerText =
        data.totalProducts;

        document.getElementById("totalOrders").innerText =
        data.totalOrders;

        document.getElementById("totalRevenue").innerText =
        "₹" + data.totalRevenue;

    }

    catch (err) {

        console.log(err);

    }

}

// =========================
// Open Edit Modal
// =========================

function openEditModal() {

    document.getElementById("editName").value =
    user.name;

    document.getElementById("editEmail").value =
    user.email;

    const modal = new bootstrap.Modal(
        document.getElementById("editProfileModal")
    );

    modal.show();

}



// =========================
// Save Profile
// =========================

async function saveProfile() {

    const name =
    document.getElementById("editName").value.trim();
    if (name.length < 3) {

    alert("Name must be at least 3 characters");

    return;
    }


    const email =
    document.getElementById("editEmail").value.trim();


    if (!name || !email) {

        alert("Please fill all fields");

        return;

    }


    try {

        const res = await fetch(

            "http://localhost:8080/api/profile",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: "Bearer " + token

                },

                body: JSON.stringify({

                    name,

                    email

                })

            }

        );


        const data = await res.json();


        if (!res.ok) {

            alert(data.message);

            return;

        }


        // Update Local Storage

        user.name = data.user.name;

        user.email = data.user.email;

        localStorage.setItem(

            "user",

            JSON.stringify(user)

        );


        // Refresh Profile

        loadProfile();


        // Close Modal

        bootstrap.Modal
        .getInstance(
            document.getElementById("editProfileModal")
        )
        .hide();


        alert("Profile Updated Successfully");


    }

    catch (err) {

        console.log(err);

        alert("Profile update failed");

    }

}

// =========================
// Change Password
// =========================

async function changePassword() {

    const currentPassword =
    document.getElementById("currentPassword").value;

    const newPassword =
    document.getElementById("newPassword").value;

    const confirmPassword =
    document.getElementById("confirmPassword").value;

    if (newPassword.length < 6) {

      alert("Password must be at least 6 characters");

      return;

    }

    if (currentPassword === newPassword) {

      alert("New password must be different");

      return;

    }


    if (!currentPassword || !newPassword || !confirmPassword) {

        alert("Please fill all fields");

        return;

    }


    if (newPassword !== confirmPassword) {

        alert("New passwords do not match");

        return;

    }


    try {

        const res = await fetch(

            "http://localhost:8080/api/profile/change-password",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: "Bearer " + token

                },

                body: JSON.stringify({

                    currentPassword,

                    newPassword

                })

            }

        );


        const data = await res.json();


        if (!res.ok) {

            alert(data.message);

            return;

        }


        alert("Password changed successfully");


        document.getElementById("currentPassword").value = "";

        document.getElementById("newPassword").value = "";

        document.getElementById("confirmPassword").value = "";


        bootstrap.Modal
        .getInstance(
            document.getElementById("changePasswordModal")
        )
        .hide();

    }

    catch (err) {

        console.log(err);

        alert("Password update failed");

    }

}


loadProfile();

loadStats();