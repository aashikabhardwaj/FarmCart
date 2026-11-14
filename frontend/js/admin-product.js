// =========================
// Logout
// =========================

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href="login.html";

}


// =========================
// Authentication
// =========================

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if(!token || !user){

    window.location.href="login.html";

}

if(user.role !== "admin"){

    alert("Access Denied");

    window.location.href="index.html";

}



// =========================
// Global Products Array
// =========================

let allProducts = [];



// =========================
// Load Products
// =========================

async function loadProducts(){

    try{

        const res = await fetch(
            "http://localhost:8080/api/admin/products",
            {

                headers:{

                    Authorization:
                    "Bearer " + token

                }

            }
        );

        const products = await res.json();

        console.log(products);

        allProducts = products;

        updateStats(products);

        displayProducts(products);

    }

    catch(err){

        console.log(err);

    }

}



// =========================
// Update Cards
// =========================

function updateStats(products){

    document.getElementById("totalProducts").innerText =
    products.length;


    document.getElementById("farmerProducts").innerText =
    products.filter(
        p => p.seller && p.seller.role==="farmer"
    ).length;


    document.getElementById("retailerProducts").innerText =
    products.filter(
        p => p.seller && p.seller.role==="retailer"
    ).length;


    document.getElementById("lowStockProducts").innerText =
    products.filter(
        p => p.quantity <= 5
    ).length;

}

// =========================
// Display Products
// =========================

function displayProducts(products){

    const table = document.getElementById("productsTable");

    table.innerHTML = "";

    products.forEach(product=>{

        table.innerHTML += `

        <tr>

        <td>

        <img src="${product.image}"
        alt="${product.name}">

        </td>

        <td>

        ${product.name}

        </td>

        <td>

        ${product.seller ? product.seller.name : "-"}

        </td>

        <td>

        ${
            product.seller
            ? product.seller.role
            : "-"
        }

        </td>

        <td>

        ₹${product.price}

        </td>

        <td>

        ${product.quantity}

        </td>

        <td>

        ${
            product.quantity<=5

            ?

            `<span class="low-stock">
            Low Stock
            </span>`

            :

            `<span class="in-stock">
            In Stock
            </span>`

        }

        </td>

        <td>

        <button
        class="btn-delete"
        onclick="deleteProduct('${product._id}')">

        <i class="fa-solid fa-trash"></i>

        </button>

        </td>

        </tr>

        `;

    });

}



// =========================
// Search
// =========================

document
.getElementById("searchProduct")
.addEventListener("input",function(){

    const value=this.value.toLowerCase();

    const filtered=

    allProducts.filter(product=>

        product.name
        .toLowerCase()
        .includes(value)

    );

    displayProducts(filtered);

});



// =========================
// Filter
// =========================

document
.getElementById("productFilter")
.addEventListener("change",function(){

    const value=this.value;

    if(value==="all"){

        displayProducts(allProducts);

    }

    else if(value==="farmer"){

        displayProducts(

            allProducts.filter(

                p=>p.seller &&
                p.seller.role==="farmer"

            )

        );

    }

    else if(value==="retailer"){

        displayProducts(

            allProducts.filter(

                p=>p.seller &&
                p.seller.role==="retailer"

            )

        );

    }

    else{

        displayProducts(

            allProducts.filter(

                p=>p.quantity<=5

            )

        );

    }

});




// =========================
// Delete Product
// =========================

async function deleteProduct(id){

    const confirmDelete=

    confirm(
        "Delete this product?"
    );

    if(!confirmDelete)
    return;

    try{

        const res=await fetch(

            `http://localhost:8080/api/admin/products/${id}`,

            {

                method:"DELETE",

                headers:{

                    Authorization:
                    "Bearer "+token

                }

            }

        );

        const data=await res.json();

        alert(data.message);

        loadProducts();

    }

    catch(err){

        console.log(err);

    }

}



// =========================

loadProducts();