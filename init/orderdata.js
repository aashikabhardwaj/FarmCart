
const mongoose = require("mongoose");
const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");

mongoose.connect("mongodb://127.0.0.1:27017/farmcart")
  .then(() => console.log("MongoDB Connected for order seeding"))
  .catch(err => console.log(err));

const seedOrders = async () => {
  await Order.deleteMany({}); // clear old data

  // 👉 Find one user and one product to use in demo order
  const user = await User.findOne();
  const product = await Product.findOne();

  if (!user || !product) {
    console.log("Please insert some users and products first.");
    process.exit();
  }

  const orders = [
    {
      buyer: user._id,
      items: [{ product: product._id, quantity: 2 }],
      totalAmount: product.price * 2,
      status: "Pending"
    },
    {
      buyer: user._id,
      items: [{ product: product._id, quantity: 5 }],
      totalAmount: product.price * 5,
      status: "Confirmed"
    }
  ];

  await Order.insertMany(orders);
  console.log("Sample orders added");
  mongoose.connection.close();
};

seedOrders();
