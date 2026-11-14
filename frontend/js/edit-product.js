const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

if (user.role !== "farmer" && user.role !== "retailer") {
  alert("Access Denied");
  window.location.href = "index.html";
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const token = localStorage.getItem("token");

async function loadProduct() {

    const res = await fetch(
        `http://localhost:8080/api/products/${id}`
    );

    const product = await res.json();

    document.getElementById("name").value = product.name;
    document.getElementById("price").value = product.price;
    document.getElementById("quantity").value = product.quantity;
    document.getElementById("category").value = product.category;
    document.getElementById("description").value = product.description;

    document.getElementById("previewImage").src =
        "http://localhost:8080/" +
        product.image.replace(/\\/g,"/");
}

loadProduct();

document.getElementById("image")
.addEventListener("change",e=>{

    if(e.target.files[0]){

        document.getElementById("previewImage").src =
            URL.createObjectURL(e.target.files[0]);
    }

});

document.getElementById("editProductForm")
.addEventListener("submit",async(e)=>{

    e.preventDefault();

    const formData = new FormData();

    formData.append(
        "name",
        document.getElementById("name").value
    );

    formData.append(
        "price",
        document.getElementById("price").value
    );

    formData.append(
        "quantity",
        document.getElementById("quantity").value
    );

    formData.append(
        "category",
        document.getElementById("category").value
    );

    formData.append(
        "description",
        document.getElementById("description").value
    );

    if(document.getElementById("image").files[0]){

        formData.append(
            "image",
            document.getElementById("image").files[0]
        );

    }

    try{

        await fetch(
            `http://localhost:8080/api/products/${id}`,
            {
                method:"PUT",

                headers:{
                    Authorization:`Bearer ${token}`
                },

                body:formData
            }
        );

        alert("Product Updated Successfully");

        if (user.role === "farmer") {
         window.location.href = "myproduct.html";
        } else {
         window.location.href = "retailer-products.html";
        }

    }
    catch(err){

        console.log(err);

        alert("Update Failed");

    }

});

