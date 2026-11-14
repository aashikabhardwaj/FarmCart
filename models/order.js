
const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User", // who placed the order
      required: true,
    },

    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    retailer: {
    type: Schema.Types.ObjectId,
    ref: "User"
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    packagingType: {
       type: String,
       default: "",
    },

    packagingStatus: {
       type: String,
       enum: ["Not Selected", "Selected", "Returned"],
       default: "Not Selected",
    },
    rewardPointsEarned: {
      type: Number,
      default: 0,
    },

    rewardPointsUsed: {
      type: Number,
      default: 0,
    },

    rewardDiscount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
