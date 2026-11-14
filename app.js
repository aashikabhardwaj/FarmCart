const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const methodOverride = require("method-override");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const PackagingReturn = require("./models/packagingReturn");
const jwt = require("jsonwebtoken");
//dotenv.config();
require("dotenv").config();

// Models
const User = require("./models/user");
const Product = require("./models/product");
const Review = require("./models/reviews");
const Order = require("./models/order");
const Cart = require("./models/cart");
console.log("Cart model:", Cart);
const getDemoUser = require("./util/demouser");
const Delivery = require("./models/delivery");
const RewardWallet = require("./models/RewardWallet");
app.use(cors());

// App config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/uploads", express.static("uploads"));
//app.use(cors());

// 2. MULTER CONFIG (imports ke baad, routes se pehle)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("Hi, FarmCart Root!");
});
// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role });
  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});


//auth middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};


// ===== USERS =====
app.get("/userlisting", async (req, res) => {
  const userlisting = await User.find({});
  res.render("userlisting/index", { userlisting });
});
app.get("/userlisting/new", (req, res) => {
  res.render("userlisting/new");
});
app.post("/userlisting", async (req, res) => {
  const userlisting = new User(req.body.userlisting);
  await userlisting.save();
  res.redirect("/userlisting");
});
app.get("/userlisting/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("userlisting/show", { userlisting: user });
});
app.get("/userlisting/:id/edit", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("userlisting/edit", { userlisting: user });
});
app.put("/userlisting/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body.userlisting);
  res.redirect("/userlisting");
});
app.delete("/userlisting/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/userlisting");
});

// ===== PRODUCTS =====
app.get("/products", async (req, res) => {
  const products = await Product.find({});
  res.render("products/index", { products });
});

app.get("/products/new", async (req, res) => {
  try {
    const sellers = await User.find({ role: "farmer" }); // ✅ use 'farmer' instead of 'seller'
    const categories = ["Vegetable", "Fruit", "Dairy", "Grain", "Seed", "Others"];
    res.render("products/new", { sellers, categories });
  } catch (err) {
    console.log("Error loading form:", err);
    res.send("Error loading form");
  }
});

app.post("/products", upload.single("image"), async (req, res) => {
  console.log("BODY =", req.body);
  console.log("FILE =", req.file);
  try {
    const { name, price, seller, category, quantity, description } = req.body;
     const image = req.file ? req.file.path : "";
    // Save new product
    const newProduct = new Product({ name, price, seller, category, quantity, description,
      image, });
    await newProduct.save();

    res.redirect("/products");
  } catch (err) {
    console.log("Error adding product:", err.message);
    res.send("Error adding product: " + err.message);
  }
});

app.get("/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  const reviews = await Review.find({ product: req.params.id }).populate("user");
  res.render("products/show", { product, reviews });
});
app.get("/products/:id/edit", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render("products/edit", { product });
});
app.put("/products/:id", async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, req.body.product);
  res.redirect("/products");
});
app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/products");
});

app.delete("/api/products/:id", protect, async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            message: "Product Deleted Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.put(
  "/api/products/:id",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {

      const product = await Product.findById(req.params.id);

      if (!product) {
         return res.status(404).json({
            message: "Product not found"
        });
      }

      if (product.seller.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            message: "Access Denied"
        });
      }

      const updateData = {
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        category: req.body.category
      };

      if (req.file) {
        updateData.image = req.file.path;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json(updatedProduct);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Update failed"
      });

    }
  }
);

app.get("/api/profile", protect, async (req, res) => {

    try {

        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json(user);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/api/products", async (req, res) => {

    try {

        const filter = {};

        if (req.query.seller) {
            filter.seller = req.query.seller;
        }

        const products = await Product.find(filter)
            .populate("seller", "name email role")
            .populate("retailer", "name email role");

        res.json(products);

    } catch (err) {

        console.error("Error fetching products:", err);

        res.status(500).json({
            error: "Failed to fetch products"
        });

    }

});


app.post("/api/products", protect, upload.single("image"), async (req, res) => {
  try {
    const { name, price, quantity, description, category, ecoFriendly } = req.body;
    const image = req.file ? req.file.path : "";

    // ✅ check user role
    if (req.user.role === "farmer") {
      const newProduct = new Product({
        name,
        price,
        quantity,
        description,
        category,
        ecoFriendly,
        image,
        seller: req.user._id,   // 👈 farmer ka product
      });
      await newProduct.save();
      return res.status(201).json(newProduct);

    } else if (req.user.role === "retailer") {
      const newProduct = new Product({
        name,
        price,
        quantity,
        description,
        category,
        ecoFriendly,
        image,
        seller: req.user._id, // 👈 retailer ka product
      });
      await newProduct.save();
      return res.status(201).json(newProduct);

    } else {
      return res.status(400).json({ message: "Only farmers or retailers can add products" });
    }
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Farmers-only products (based on seller role)
app.get("/api/farmproducts", async (req, res) => {
  try {
    // Populate seller info
    const farmProducts = await Product.find()
      .populate("seller", "name role") // seller ka role check karne ke liye
      .then(products => products.filter(p => p.seller.role === "farmer")); // sirf farmer sellers

    res.json(farmProducts);
  } catch (err) {
    console.error("Error fetching farm products:", err);
    res.status(500).json({ error: "Failed to fetch farm products" });
  }
});

// ✅ Sirf farmer products API
app.get("/api/my-products", protect, async (req, res) => {

    try {

        const farmerProducts = await Product.find({
            seller: req.user._id
        });

        res.json(farmerProducts);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error fetching farmer products"
        });

    }

});

app.get("/api/my-eco-products", protect, async (req, res) => {
  try {

    const ecoProducts = await Product.find({
      seller: req.user._id,
      category: "Others"
    });

    res.json(ecoProducts);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching eco products" });
  }
});

app.get("/api/farmer-products", async (req, res) => {

    try {

        const { seller } = req.query;

        let products = await Product.find({})
            .populate("seller", "name role");

        products = products.filter(product => {

            if (!product.seller) return false;

            if (product.seller.role !== "farmer") return false;

            if (seller && product.seller._id.toString() !== seller)
                return false;

            return true;

        });

        res.json(products);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to fetch farmer products"
        });

    }

});

//stock portion
app.put("/api/update-stock/:id", protect, async (req, res) => {

    try {

        const { quantity } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        product.quantity = Number(quantity);
        product.availability = Number(quantity) > 0;

        await product.save();

        res.json({
            message: "Stock Updated Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/api/retailer-inventory", protect, async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user._id
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/retailer-inventory/:id", protect, async (req, res) => {
  try {

    const { quantity } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    product.quantity = quantity;

    await product.save();

    res.json({
      message: "Stock updated successfully",
      product
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// ✅ Get single product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name role");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});


// Farm products only
app.get("/api/farm-products", async (req, res) => {
  try {
    const farmProducts = await Product.find({ category: "Farm" });
    res.json(farmProducts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch farm products" });
  }
});

// Eco-friendly products only
app.get("/api/eco-products", async (req, res) => {
  try {
    const ecoProducts = await Product.find({ category: "Others" });
    res.json(ecoProducts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch eco-friendly products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/eco-products", async (req, res) => {
  try {
    // ✅ only ecoFriendly: true filter
    const ecoProducts = await Product.find({ category: Others });
    res.json(ecoProducts);
  } catch (err) {
    console.error("Error fetching eco products:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/api/eco-products", async (req, res) => {
  try {
    const ecoProducts = await Product.find({ category: Others });
    res.json(ecoProducts);
  } catch (err) {
    console.error("Error fetching eco products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/api/reviews/:productId", protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: product._id, user: req.user._id });
    if (existingReview) return res.status(400).json({ message: "Already reviewed" });

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      rating,
      comment
    });

    // Update averageRating in product
    const reviews = await Review.find({ product: product._id });
    product.averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await product.save();

    res.status(201).json({ message: "Review added", review, averageRating: product.averageRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET reviews for a product
/*app.get("/reviews/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "name");
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});*/
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product); // reviews + averageRating included
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a review
app.put("/api/reviews/:productId/:reviewId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Not authorized" });

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    product.ratings = product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length;

    await product.save();
    res.json({ message: "Review updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/*app.get("/api/reviews/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate("reviews.user", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product.reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});*/

app.get("/api/reviews/:productId", async (req, res) => {
  try {
    // Review collection se fetch karo, user ka name populate karke
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "name");
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// ===== CART =====

app.get("/cart", async (req, res) => {
  const demoUser = await getDemoUser();
  const cart = await Cart.findOne({ buyer: demoUser._id }).populate("items.product");
  res.render("cart/index", { cart });
});

// Delete cart item
app.delete("/api/cart/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Cart.findByIdAndDelete(id);
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Add to cart (logged-in user)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get current user's cart
app.get("/api/cart", protect, async (req, res) => {
  try {
    // find cart for logged-in user
    const cart = await Cart.findOne({ buyer: req.user._id }).populate("items.product","name price image");

    // if no cart exists, return empty
    if (!cart) return res.json({ items: [], totalPrice: 0 });

    res.json(cart);
  } catch (err) {
    console.error("Cart fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Add product to cart
app.post("/cart/add/:productId", protect, async (req, res) => {
  try {
    const buyerId = req.user._id;
    const productId = req.params.productId;
    const quantity = Number(req.body.quantity) || 1;

    let cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) cart = new Cart({ buyer: buyerId, items: [] });

    const product = await Product.findById(productId);
    if (!product) return res.status(400).send("Product not found");

    const index = cart.items.findIndex(i => i.product.equals(productId));
    if (index > -1) cart.items[index].quantity += quantity;
    else cart.items.push({ product: productId, quantity });

    // recalc total
    cart= await cart.populate("items.product");
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    await cart.save();
    res.json(cart); // send JSON for frontend
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).send("Server error");
  }
});

// Remove product from cart
app.post("/cart/remove/:productId", protect, async (req, res) => {
  try {
    const buyerId = req.user._id;
    const productId = req.params.productId;

    let cart = await Cart.findOne({ buyer: buyerId }).populate("items.product");
    if (!cart) return res.status(400).send("Cart not found");

    cart.items = cart.items.filter(item => !item.product._id.equals(productId));
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).send("Server error");
  }
});


// ===== ORDERS =====
app.get("/orders", async (req, res) => {
  try {
     if (!req.user || !req.user._id) {
      return res.send("Please login first");
    }

    const orders = await Order.find({ buyer: req.user._id }) // only logged-in user's orders
      .populate("buyer", "name email")
      .populate("items.product", "name price");

    res.render("orders/index", { orders });
  } catch (err) {
    console.error(err);
    res.send("Error fetching orders");
  }
});


app.get("/orders/new", async (req, res) => {
  const users = await User.find();
  const products = await Product.find();
  res.render("orders/new", { users, products });
});
// Create order
app.post("/api/orders", protect, async (req, res) => {
  try {
    const { product, quantity, useReward } = req.body;

    if (!req.user) return res.status(401).json({ message: "Login required" });

    const selectedProduct = await Product.findById(product).populate("seller");;
    if (!selectedProduct) return res.status(404).json({ message: "Product not found" });

    const orderData = {
      buyer: req.user._id,
      items: [{ product, quantity }],
      totalAmount: selectedProduct.price * quantity,
      status: "Pending"
    };

    // Reward Wallet
    if (useReward) {

     const sellerId =
        selectedProduct.seller._id;

     const wallet = await RewardWallet.findOne({

        customer: req.user._id,
        seller: sellerId

     });

     if (wallet && wallet.points >= 10) {

           const usedCoins = Math.floor(wallet.points / 10) * 10;

           const discount = (usedCoins / 10) * 5;

           orderData.rewardPointsUsed = usedCoins;

           orderData.rewardDiscount = discount;

           orderData.totalAmount = Math.max( 0,
            orderData.totalAmount - discount
           );

         wallet.points -= usedCoins;

         await wallet.save();

      }

  }

    if (selectedProduct.seller.role === "farmer") {
       orderData.farmer = selectedProduct.seller._id;
    }

    if (selectedProduct.seller.role === "retailer") {
       orderData.retailer = selectedProduct.seller._id;
    }

    const order = new Order(orderData);

      await order.save();
      res.status(201).json({ message: "Order placed successfully", order });
      } catch (err) {
      res.status(400).json({ message: err.message });
      }
});

app.get("/api/farmer-orders", protect, async (req, res) => {
  try {

    const orders = await Order.find({
      farmer: req.user._id
    })
    .populate("buyer", "name")
    .populate("items.product");
    res.json(orders);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Error fetching orders"
    });

  }
});

app.get("/api/packaging/pending-count", protect, async (req, res) => {

    try {

        const count = await PackagingReturn.countDocuments({

            seller: req.user._id,

            status: "Pending"

        });

        res.json({

            pending: count

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

});

app.get("/api/packaging/requests", protect, async (req, res) => {

    try {

        const requests = await PackagingReturn.find({

            seller: req.user._id

        })

        .populate("customer", "name")

        .sort({

            createdAt: -1

        });

        res.json(requests);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

});

app.get("/api/packaging/request/:id", protect, async (req, res) => {

    try {

        const request = await PackagingReturn.findById(req.params.id)

            .populate("customer", "name");

        if (!request) {

            return res.status(404).json({
                message: "Request not found."
            });

        }

        res.json(request);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.put("/api/packaging/request/:id", protect, async (req, res) => {

    try {

        const { status } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status."
            });
        }


        const request = await PackagingReturn.findById(req.params.id);


        if (!request) {
            return res.status(404).json({
                message: "Request not found."
            });
        }


        if (request.status === "Approved") {
            return res.status(400).json({
                message: "Request is already approved."
            });
        }


        // Seller verification
        if (request.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Access denied."
            });
        }



        request.status = status;



        // ================= APPROVED =================
        if (status === "Approved") {

        let points = 0;
        if (req.user.role === "farmer") {

        switch (request.packagingType) {

            case "Wooden Box":
               points += 50;
               break;

            case "Glass Bottle":
               points += 40;
               break;

            case "Plastic Crate":
               points += 35;
               break;

            case "Cloth Bag":
               points += 30;
               break;

            default:
               points += 20;
            }

        } else if (req.user.role === "retailer") {
            switch (request.packagingType) {

            case "Glass Bottle":
               points += 50;
               break;

            case "Jute Bag":
                points += 40;
                break;

            case "Cloth Bag":
                 points += 35;
                 break;

            case "Paper Box":
                 points += 30;
                 break;

            case "Paper Wrap":
                 points += 25;
                 break;

            default:
                 points += 20;
             }

        }

            // Condition bonus
            switch (request.condition) {

                case "Excellent":
                    points += 20;
                    break;

                case "Good":
                    points += 10;
                    break;

                case "Damaged":
                    points += 0;
                    break;
            }



            request.rewardPoints = points;



            // Update Order
            const order = await Order.findById(request.order);

            if (order) {

                order.rewardPointsEarned = points;
                order.packagingStatus = "Returned";

                await order.save();
            }



            // Update Customer Points
            const customer = await User.findById(request.customer);


            if (customer) {

                customer.ecoPoints =
                    (customer.ecoPoints || 0) + points;


                customer.greenScore =
                    (customer.greenScore || 0) + 10;



                // Eco Status

                if (customer.ecoPoints >= 700) {

                    customer.ecoStatus = "Eco Hero";

                } 
                else if (customer.ecoPoints >= 300) {

                    customer.ecoStatus = "Eco Champion";

                } 
                else if (customer.ecoPoints >= 100) {

                    customer.ecoStatus = "Eco Supporter";

                } 
                else {

                    customer.ecoStatus = "Eco Beginner";

                }



                await customer.save();

            }




            // ================= SELLER WISE WALLET =================


            let wallet = await RewardWallet.findOne({

                customer: request.customer,
                seller: request.seller

            });



            if (!wallet) {


                wallet = new RewardWallet({

                    customer: request.customer,
                    seller: request.seller,
                    points: points

                });


            } else {


                wallet.points += points;

            }



            await wallet.save();


        }



        await request.save();



        res.json({

            message: `Request ${status} successfully.`

        });



    } catch (err) {


        console.error("Packaging Approval Error:", err);


        res.status(500).json({

            message: "Server Error",
            error: err.message

        });

    }

});

//admin packaging
app.get("/api/admin/packaging", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const requests = await PackagingReturn.find()

            .populate("customer", "name email")
            .populate("seller", "name role")
            .populate("order", "_id")

            .sort({ createdAt: -1 });

        const totalRewardPoints = requests.reduce(
           (sum, r) => sum + (r.rewardPoints || 0),
             0
             );

        const farmerRewards = requests
            .filter(r => r.seller?.role === "farmer")
            .reduce((sum, r) => sum + (r.rewardPoints || 0), 0);

        const retailerRewards = requests
            .filter(r => r.seller?.role === "retailer")
            .reduce((sum, r) => sum + (r.rewardPoints || 0), 0);

        const wallets = await RewardWallet.find();

        const totalWalletBalance = wallets.reduce(
            (sum, w) => sum + (w.points || 0),
             0
         );
        res.json({
                  requests,
                  totalRewardPoints,
                  farmerRewards,
                  retailerRewards,
                  totalWalletBalance

                 });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/api/retailer-orders", protect, async (req, res) => {

    try {

        const orders = await Order.find({
            retailer: req.user._id
        })
        .populate("buyer", "name")
        .populate("items.product");

        res.json(orders);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error fetching retailer orders"
        });

    }

});

//best selling of retailer
app.get("/api/retailer-best-selling", protect, async (req,res)=>{

    try{

        const orders = await Order.find({
            retailer: req.user._id
        })
        .populate("items.product");


        let sales = {};


        orders.forEach(order=>{

            order.items.forEach(item=>{

                if(item.product){

                    let name = item.product.name;

                    if(!sales[name]){
                        sales[name] = 0;
                    }

                    sales[name] += item.quantity;

                }

            });

        });


        const bestSelling = Object.entries(sales)
        .map(([name,sold])=>({
            name,
            sold
        }))
        .sort((a,b)=> b.sold - a.sold)
        .slice(0,4);


        res.json(bestSelling);


    }
    catch(err){

        console.log("Best selling error:",err);

        res.status(500).json({
            message:"Error fetching best selling products"
        });

    }

});

// Smart Restock Suggestion

app.get("/api/retailer-restock", protect, async (req,res)=>{

    try{

        const products = await Product.find({
            seller: req.user._id
        });


        const suggestions = products.filter(product => 
            product.quantity <= 5
        );


        res.json(suggestions);


    }
    catch(err){

        console.log("Restock error:", err);

        res.status(500).json({
            message:"Error fetching restock suggestions"
        });

    }

});

app.get("/api/retailer-earnings", protect, async (req, res) => {

    try {

        const orders = await Order.find({
            retailer: req.user._id
        });

        const totalOrders = orders.length;

        const pendingOrders = orders.filter(
            o => o.status === "Pending"
        ).length;

        const confirmedOrders = orders.filter(
            o => o.status === "Confirmed"
        ).length;

        const cancelledOrders = orders.filter(
            o => o.status === "Cancelled"
        ).length;

        const revenueOrders = orders.filter(
            o =>
                o.status === "Confirmed" ||
                o.status === "Shipped" ||
                o.status === "Delivered"
        );

        const totalRevenue = revenueOrders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
        );

        const averageOrderValue =
            revenueOrders.length > 0
                ? (totalRevenue / revenueOrders.length).toFixed(2)
                : 0;

        res.json({
            totalRevenue,
            totalOrders,
            confirmedOrders,
            pendingOrders,
            cancelledOrders,
            averageOrderValue
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error fetching earnings"
        });

    }

});



app.put("/api/orders/:id/status", protect, async (req, res) => {

  try {

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status
      },
      {
        new: true
      }
    );

    res.json(order);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Status update failed"
    });

  }

});

// add for packaging functionality
app.put("/api/orders/:id/packaging", protect, async (req, res) => {

  try {

    const { packagingType } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.packagingType = packagingType;
    order.packagingStatus = "Selected";

    await order.save();

    res.json({
      message: "Packaging saved successfully",
      order
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Packaging save failed"
    });

  }

});

// Get current user's orders
app.get("/api/my-orders", protect, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Login required" });

    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "name price image")
      .populate("buyer", "name email");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//for packaging
// Get current user's orders with packaging request
app.get("/api/my-orders-with-packaging", protect, async (req, res) => {

    try {

        const orders = await Order.find({
            buyer: req.user._id
        })
        .populate("items.product", "name price image")
        .populate("buyer", "name email");

        const result = [];

        for (const order of orders) {

            const request = await PackagingReturn.findOne({
                order: order._id
            });

            const orderObj = order.toObject();

            orderObj.packagingRequest = request;

            result.push(orderObj);

        }

        res.json(result);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.post("/orders", async (req, res) => {
  const { buyer, product, quantity } = req.body;
  const selectedProduct = await Product.findById(product);
  const totalAmount = selectedProduct.price * quantity;
  const order = new Order({ buyer, items: [{ product, quantity }], totalAmount });
  await order.save();
  res.redirect("/orders");
});
app.get("/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("buyer", "name email")
    .populate("items.product", "name price");
  res.render("orders/show", { order });
});
app.get("/orders/:id/edit", async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("buyer")
    .populate("items.product");
  const users = await User.find();
  const products = await Product.find();
  res.render("orders/edit", { order, users, products });
});
app.put("/orders/:id", async (req, res) => {
  const { status, quantity } = req.body;
  const order = await Order.findById(req.params.id).populate("items.product");
  if (quantity) {
    const productPrice = order.items[0].product.price;
    order.items[0].quantity = quantity;
    order.totalAmount = productPrice * quantity;
  }
  if (status) order.status = status;
  await order.save();
  res.redirect(`/orders/${req.params.id}`);
});
app.delete("/orders/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the order completely
    await Order.findByIdAndDelete(id);

    res.redirect("/orders"); // orders page par wapas
  } catch (err) {
    console.error(err);
    res.send("Error cancelling order");
  }
});

// ================= ADMIN DASHBOARD =================

app.get("/api/admin/dashboard", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const totalUsers = await User.countDocuments();

        const totalFarmers = await User.countDocuments({
            role: "farmer"
        });

        const totalRetailers = await User.countDocuments({
            role: "retailer"
        });

        const totalCustomers = await User.countDocuments({
            role: "customer"
        });

        const totalProducts = await Product.countDocuments();

        const totalOrders = await Order.countDocuments();

        const revenue = await Order.aggregate([
            {
                $match: {
                    status: {
                        $ne: "Cancelled"
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        const totalRevenue =
            revenue.length > 0 ? revenue[0].totalRevenue : 0;

        const recentUsers = await User.find()
            .select("name email role createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentOrders = await Order.find()
            .populate("buyer", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({

            totalUsers,
            totalFarmers,
            totalRetailers,
            totalCustomers,
            totalProducts,
            totalOrders,
            totalRevenue,

            recentUsers,
            recentOrders

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Dashboard Error"
        });

    }

});


// ======= DELIVERY =======
// Create delivery
app.post("/deliveries", async (req, res) => {
  const { order, deliveryBoy } = req.body;
  try {
    const delivery = new Delivery({ order, deliveryBoy });
    await delivery.save();
    res.send(delivery);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all deliveries
app.get("/deliveries", async (req, res) => {
  const deliveries = await Delivery.find().populate("order deliveryBoy");
  res.send(deliveries);
});

// Get single delivery
app.get("/deliveries/:id", async (req, res) => {
  const delivery = await Delivery.findById(req.params.id).populate("order deliveryBoy");
  res.send(delivery);
});

// Update delivery
app.put("/deliveries/:id", async (req, res) => {
  const { status, deliveryDate } = req.body;
  const delivery = await Delivery.findByIdAndUpdate(
    req.params.id,
    { status, deliveryDate },
    { new: true }
  );
  res.send(delivery);
});

// Delete delivery
app.delete("/deliveries/:id", async (req, res) => {
  await Delivery.findByIdAndDelete(req.params.id);
  res.send("Delivery deleted");
});

// ======================================
// Admin Dashboard Stats
// ======================================

app.get("/api/admin/dashboard", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const totalUsers = await User.countDocuments();

        const totalProducts = await Product.countDocuments();

        const totalOrders = await Order.countDocuments();

        const totalFarmers = await User.countDocuments({
            role: "farmer"
        });

        const totalRetailers = await User.countDocuments({
            role: "retailer"
        });

        const totalCustomers = await User.countDocuments({
            role: "customer"
        });

        const revenue = await Order.aggregate([
            {
                $match: {
                    status: {
                        $ne: "Cancelled"
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        res.json({

            totalUsers,

            totalProducts,

            totalOrders,

            totalFarmers,

            totalRetailers,

            totalCustomers,

            totalRevenue: revenue.length
                ? revenue[0].totalRevenue
                : 0

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Dashboard Error"
        });

    }

});

// ======================================
// Recent Users
// ======================================

app.get("/api/admin/recent-users", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const users = await User.find()
            .select("name role createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json(users);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error loading users"
        });

    }

});

// ======================================
// Recent Orders
// ======================================

app.get("/api/admin/recent-orders", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const orders = await Order.find()
            .populate("buyer", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json(orders);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error loading orders"
        });

    }

});

// =======================
// Admin - Get All Users
// =======================

app.get("/api/admin/users", protect, async (req, res) => {

    try {

        // Sirf admin access
        if (req.user.role !== "admin") {

            return res.status(403).json({
                message: "Access Denied"
            });

        }

        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error fetching users"
        });

    }

});

// =======================
// Admin - Update User Role
// =======================

app.put("/api/admin/users/:id/role", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const { role } = req.body;

        const allowedRoles = [
            "customer",
            "buyer",
            "farmer",
            "retailer",
            "deliveryBoy"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Role updated successfully",
            user
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error updating role"
        });

    }

});

// =======================
// Admin - Delete User
// =======================

app.delete("/api/admin/users/:id", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        // Admin khud ko delete na kar sake
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({
                message: "You cannot delete your own account."
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error deleting user"
        });

    }

});

// ===============================
// Admin - Get All Products
// ===============================

app.get("/api/admin/products", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                message: "Access Denied"
            });

        }

        const products = await Product.find({})
            .populate("seller", "name role")
            .sort({ createdAt: -1 });

        res.json(products);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error fetching products"
        });

    }

});

// ===============================
// Admin - Delete Product
// ===============================

app.delete("/api/admin/products/:id", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            return res.status(403).json({
                message: "Access Denied"
            });

        }

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            message: "Product deleted successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error deleting product"
        });

    }

});

// =========================
// Admin Orders API
// =========================

app.get("/api/admin/orders", protect, async (req,res)=>{

    try{


        // only admin access

        if(req.user.role !== "admin"){

            return res.status(403).json({

                message:"Access Denied"

            });

        }



        const orders = await Order.find()

        .populate("buyer","name email")

        .populate("farmer","name email")

        .populate("retailer","name email")

        .sort({

            createdAt:-1

        });



        res.json(orders);



    }
    catch(err){


        console.log(err);


        res.status(500).json({

            message:"Server Error"

        });


    }


});

// =========================
// Admin Single Order Details
// =========================

app.get("/api/admin/orders/:id", protect, async (req,res)=>{

    try{


        if(req.user.role !== "admin"){

            return res.status(403).json({

                message:"Access Denied"

            });

        }



        const order = await Order.findById(req.params.id)

        .populate("buyer","name email")

        .populate("farmer","name email")

        .populate("retailer","name email")

        .populate("items.product");



        if(!order){

            return res.status(404).json({

                message:"Order not found"

            });

        }



        res.json(order);



    }
    catch(err){


        console.log(err);


        res.status(500).json({

            message:"Server Error"

        });


    }


});

//=======login/signup=======
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role, adminCode, phone, address } = req.body;

    // Convert email to lowercase for consistency
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    //const hashedPass = await bcrypt.hash(password, 10);
    // Admin Secret Code Check

    if (role === "admin") {

       if (adminCode !== "FARMCART2026") {

           return res.status(400).json({
               message: "Invalid Admin Secret Code"
           });

       }

    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: password,
      role: role || "buyer", // default role
      phone,
      address
    });

    await newUser.save();

    // Generate JWT token immediately
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,

      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

////new ////
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ JWT Token generate karo
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token,  // important
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/profile", protect, async (req, res) => {

    try {

        const { name, email } = req.body;

        const user = await User.findById(req.user._id);

        const existingUser = await User.findOne({
           email: email.toLowerCase()
         });

        if (
          existingUser &&
          existingUser._id.toString() !== user._id.toString()
         ) {
           return res.status(400).json({
           message: "Email already exists"
           });
          }

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        user.name = name || user.name;
        user.email = email.toLowerCase();

        await user.save();

        res.json({

            message: "Profile updated successfully",

            user

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Profile update failed"

        });

    }

});

app.put("/api/profile/change-password", protect, async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                message: "Current password is incorrect"
            });

        }

        if (newPassword.length < 6) {

            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });

        }

        user.password = newPassword;
        await user.save();

        res.json({

            message: "Password changed successfully"

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Password update failed"

        });

    }

});
//reward points profile
app.get("/api/profile/rewards", protect, async (req, res) => {

    try {

        const user = await User.findById(req.user._id)
            .select("ecoPoints ecoStatus greenScore");

        const totalReturns = await PackagingReturn.countDocuments({
            customer: req.user._id,
            status: "Approved"
        });

        res.json({
            ecoPoints: user.ecoPoints,
            ecoStatus: user.ecoStatus,
            greenScore: user.greenScore,
            totalReturns
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/api/profile/seller-wallet", protect, async (req,res)=>{

    try{

        const wallets = await RewardWallet.find({
            customer:req.user._id
        })
        .populate("seller","name role");


        res.json({
           sellerRewards: wallets
        });


    }
    catch(err){

        console.error(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

});

// Get seller reward wallet
app.get("/api/reward-wallet/:sellerId", protect, async (req, res) => {

    try {

        const wallet = await RewardWallet.findOne({
            customer: req.user._id,
            seller: req.params.sellerId
        });

        res.json({
            points: wallet ? wallet.points : 0,
            discount: wallet ? wallet.points : 0
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

//Packaging return 
app.post("/api/packaging/decision", protect, upload.single("image"), async (req, res) => {

    try {

        const { orderId, decision, condition, comment } = req.body;
        const image = req.file ? req.file.filename : "";

        if (!orderId || !decision) {

            return res.status(400).json({
                message: "Order ID and decision are required."
            });

        }

        const order = await Order.findById(orderId)
            .populate("items.product");

        if (!order) {

            return res.status(404).json({
                message: "Order not found."
            });

        }

        // Sirf buyer hi request bhej sakta hai
        if (order.buyer.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                message: "Access denied."
            });

        }

        // Duplicate check
        const existing = await PackagingReturn.findOne({
            order: orderId
        });

        if (existing) {

            return res.status(400).json({
                message: "Packaging decision already submitted."
            });

        }

        // Seller identify
        const seller = order.farmer || order.retailer;

        const packagingType = order.packagingType;

        const request = new PackagingReturn({

            order: order._id,

            customer: req.user._id,

            seller,

            packagingType,

            decision,

            condition: condition || "Good",
            customerComment: comment || "",
            customerImage: image,

            rewardPoints: 0

        });

        // Keep → direct complete
        if (decision === "Keep") {

            request.status = "Kept";

        }

        // Return → Pending
        if (decision === "Return") {

            request.status = "Pending";

        }

        await request.save();
        
        res.json({

            message: "Packaging decision saved successfully."

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

});

app.get("/api/profile/seller-rewards", protect, async (req, res) => {

    try {

        const sellerRewards = await PackagingReturn.aggregate([

            {
                $match: {
                    customer: req.user._id,
                    status: "Approved"
                }
            },

            {
                $group: {
                    _id: "$seller",
                    totalPoints: {
                        $sum: "$rewardPoints"
                    }
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "sellerInfo"
                }
            },

            {
                $unwind: "$sellerInfo"
            },

            {
                $project: {
                    _id: 0,
                    sellerName: "$sellerInfo.name",
                    points: "$totalPoints"
                }
            }

        ]);


        res.json({
            sellerRewards
        });


    } catch(err) {

        console.error(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

});

// ===== SERVER =====
mongoose.connect("mongodb://127.0.0.1:27017/farmcart",)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

app.listen(8080, () => console.log("Server running on port 8080"));
