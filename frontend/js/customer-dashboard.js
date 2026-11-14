// ================= AUTH =================

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}

if (user.role !== "buyer") {
    alert("Access Denied");
    window.location.href = "index.html";
}

// ================= WELCOME =================

const welcome = document.getElementById("welcomeText");
if (welcome) {
    welcome.innerHTML = `Welcome Back, ${user.name} 👋`;
}

// ================= LOGOUT =================

function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";

}

async function loadProducts() {
    try{
        const res = await fetch("http://localhost:8080/api/products");
        allProducts = await res.json();
        allProducts = allProducts.filter(p=>p.availability===true);
        updateCategoryCount();
        loadRecommended();
        loadRecent();
        setupSearch();
    }

    catch(err){
        console.log("Dashboard Error :",err);
    }

}

loadProducts();

function updateCategoryCount(){
document.getElementById("vegCount").innerText =
allProducts.filter(p=>p.category==="Vegetable").length+" Products";
document.getElementById("fruitCount").innerText =
allProducts.filter(p=>p.category==="Fruit").length+" Products";
document.getElementById("grainCount").innerText =
allProducts.filter(p=>p.category==="Grain").length+" Products";
document.getElementById("ecoCount").innerText =
allProducts.filter(p=>p.ecoFriendly===true).length+" Products";
}

function loadRecommended(){
const container=document.getElementById("recommendedProducts");
container.innerHTML="";
allProducts.slice(0,4).forEach(product=>{
const image=
product.image
?
"http://localhost:8080/"+product.image.replace(/\\/g,"/")
:
"https://via.placeholder.com/250";
container.innerHTML+=`
<div class="product-card-item">
<div class="card h-100 shadow-sm">
<img
src="${image}"
class="card-img-top"
style="height:220px;object-fit:cover;">
<div class="card-body">
<h5 class="fw-bold text-truncate">${product.name}</h5>
<p class="text-success fw-bold">
₹${product.price}
</p>
<button
class="btn btn-success rounded-pill w-100"
onclick="location.href='pdetail.html?id=${product._id}'">
View Product
</button>
</div>
</div>
</div>
`;
});
}

function loadRecent(){
const container=document.getElementById("recentProducts");
container.innerHTML="";
const recent=[...allProducts].reverse().slice(0,4);
recent.forEach(product=>{
const image=product.image
? "http://localhost:8080/"+product.image.replace(/\\/g,"/")
: "https://via.placeholder.com/250";
container.innerHTML+=`
<div class="product-card-item">
<div class="card h-100">
<img src="${image}" class="card-img-top">
<div class="card-body">
<h5 class="fw-bold text-truncate">
${product.name}
</h5>
<p class="text-success fw-bold">
₹${product.price}
</p>
<button
class="btn btn-success rounded-pill w-100"
onclick="location.href='pdetail.html?id=${product._id}'">
View Product
</button>
</div>
</div>
</div>
`;
});
}

function setupSearch(){
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");
    function searchProduct(){
        const value = input.value.trim().toLowerCase();
        if(value===""){
            alert("Please enter a product name");
            return;
        }

        const product = allProducts.find(p =>
            p.name.toLowerCase().includes(value)
        );

        if(product){
            window.location.href = `pdetail.html?id=${product._id}`;
        }
        else{
            alert("Product not found");
        }
    }
    btn.addEventListener("click", searchProduct);
    input.addEventListener("keydown", function(e){
        if(e.key==="Enter"){
            searchProduct();
        }
    });

}