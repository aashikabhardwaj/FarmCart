const mongoose = require("mongoose");
const Product = require("./models/product"); // adjust path if needed
const User = require("./models/user");       // adjust path if needed

mongoose.connect("mongodb://127.0.0.1:27017/farmcart", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

async function migrateSellers() {
  try {
    const farmers = await User.find({ role: "farmer" });
    const products = await Product.find();

    for (const product of products) {
      const farmer = farmers.find(f => f.name === product.seller);
      if (farmer) {
        product.seller = farmer._id;
        await product.save();
      } else {
        console.log(`No farmer found for product ${product.name} (seller: ${product.seller})`);
      }
    }

    console.log("Migration complete!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Migration error:", err);
    mongoose.disconnect();
  }
}

migrateSellers();
