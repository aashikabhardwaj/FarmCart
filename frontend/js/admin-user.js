function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href="login.html";

}


const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user"));


if(!token || !user){

    window.location.href="login.html";

}


if(user.role !== "admin"){

    alert("Access Denied");

    window.location.href="index.html";

}



// Load Users

let allUsers = [];



async function loadUsers(){


    try{


        const res = await fetch(
            "http://localhost:8080/api/admin/users",
            {

                headers:{

                    "Authorization":
                    "Bearer " + token

                }

            }
        );


        const users = await res.json();


        console.log("Users:", users);


        allUsers = users;


        updateStats(users);

        displayUsers(users);


    }


    catch(err){

        console.log("Users Error:",err);

    }


}





// Stats

function updateStats(users){


    document.getElementById("totalUsers").innerText =
    users.length;



    document.getElementById("customerCount").innerText =
    users.filter(
        u=>u.role==="customer" || u.role==="buyer"
    ).length;



    document.getElementById("farmerCount").innerText =
    users.filter(
        u=>u.role==="farmer"
    ).length;



    document.getElementById("retailerCount").innerText =
    users.filter(
        u=>u.role==="retailer"
    ).length;



}






// Display Table

function displayUsers(users){


    const table =
    document.getElementById("usersTable");


    table.innerHTML="";



    users.forEach(user=>{


        table.innerHTML += `

        <tr>


        <td>${user.name}</td>


        <td>${user.email}</td>


        <td>

        <span class="badge bg-primary">

        ${user.role}

        </span>

        </td>


        <td>

        ${new Date(user.createdAt)
        .toLocaleDateString()}

        </td>

        <td>

         <button
         class="btn btn-warning btn-sm me-1"
         onclick="changeRole('${user._id}')">

         <i class="fa-solid fa-user-gear"></i>

         </button>

         <button
         class="btn btn-danger btn-sm"
         onclick="deleteUser('${user._id}')">

         <i class="fa-solid fa-trash"></i>

         </button>

         </td>

        </tr>


        `;


    });



}







// Search

document
.getElementById("searchUser")
.addEventListener("input",function(){


    const value =
    this.value.toLowerCase();



    const filtered =
    allUsers.filter(user=>

        user.name.toLowerCase()
        .includes(value)

        ||

        user.email.toLowerCase()
        .includes(value)

    );


    displayUsers(filtered);


});

//role filter
document
.getElementById("roleFilter")
.addEventListener("change", function () {

    const role = this.value;

    let filteredUsers;

    if (role === "all") {

        filteredUsers = allUsers;

    } 
    else if (role === "customer") {

        filteredUsers = allUsers.filter(user =>
            user.role === "customer" || user.role === "buyer"
        );

    } 
    else {

        filteredUsers = allUsers.filter(user =>
            user.role === role
        );

    }

    displayUsers(filteredUsers);

});


// Edit Role
async function changeRole(id){

    const newRole = prompt(
        "Enter new role (customer/farmer/retailer/deliveryBoy)"
    );

    if(!newRole) return;

    try{

        const res = await fetch(
            `http://localhost:8080/api/admin/users/${id}/role`,
            {
                method:"PUT",

                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer " + token
                },

                body: JSON.stringify({
                    role: newRole
                })

            }
        );

        const data = await res.json();

        if(!res.ok){

            alert(data.message);
            return;

        }

        alert("Role Updated Successfully");

        loadUsers();

    }
    catch(err){

        console.log(err);
        alert("Something went wrong");

    }

}



// Delete User

async function deleteUser(id){


    const confirmDelete =
    confirm(
        "Are you sure you want to delete this user?"
    );


    if(!confirmDelete)
        return;



    console.log(
        "Delete user:",
        id
    );


    // API baad me connect karenge


}

function viewUser(id){

    window.location.href =
    `admin-user-details.html?id=${id}`;

}




loadUsers();