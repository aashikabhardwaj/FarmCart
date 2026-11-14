
const mongoose = require("mongoose");
const { Schema } = mongoose;
//baad m add kia h ye 
const User = require("./user");

// reviews schema add karo
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/200x150?text=No+Image",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
    type: Number,
    required: true,
    default: 0
    },
    description: {
      type: String,
      default: "No description available",
    },
    category: {
      type: String,
      enum: ["Vegetable", "Fruit", "Grain", "Dairy", "Others"],
      default: "Others",
    },
    packagingType: {
      type: String,
      enum: ["Cloth Bag", "Wooden Box", "Glass Bottle", "Plastic Crate", "Paper Bag", "Reusable Container"],
      default: "Cloth Bag",
    },
    ecoFriendly: {
      type: Boolean,
      default: false, // by default, products are not eco-friendly
     },

     seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    
    },

     retailer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    availability: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
averageRating: { type: Number, default: 0 },

  },
  { timestamps: true }
);




// ✅ Pre-save hook to ensure seller is a valid farmer
productSchema.pre("save", async function(next) {
  if (!this.seller) return next(new Error("Product must have a seller assigned."));
  
  const sellerUser = await User.findById(this.seller);
  if (
  !sellerUser ||
  (sellerUser.role !== "farmer" && sellerUser.role !== "retailer")
   ) {
   return next(new Error("Seller must be a valid farmer or retailer."));
  }
  next();
});


const Product = mongoose.model("Product", productSchema);
module.exports = Product;


