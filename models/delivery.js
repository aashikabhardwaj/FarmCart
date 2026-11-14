const mongoose = require("mongoose");
const { Schema } = mongoose;

const deliverySchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  deliveryBoy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "In Transit", "Delivered", "Cancelled"],
    default: "Pending"
  },
  deliveryDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Delivery", deliverySchema);


