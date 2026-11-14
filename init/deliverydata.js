const mongoose = require("mongoose");
const Delivery = require("../models/delivery");  // ../ se parent folder
const Order = require("../models/order");
const User = require("../models/user");

mongoose.connect("mongodb://127.0.0.1:27017/farmcart", {
  // ab driver 4.x me ye options optional hai
})
.then(() => console.log("MongoDB connected for delivery seeding"))
.catch(err => console.error("MongoDB connection error:",err));
async function seedDelivery() {
  try {
    // Replace these IDs with actual Order and User IDs from your DB
    const orderId = "68b98ba788a60da7969a3a6c"; 
    const deliveryBoyId = "68ba99d5988a3a04b30d4ef7"; 

    const delivery = new Delivery({
      order: orderId,
      deliveryBoy: deliveryBoyId,
      status: "Pending",
      deliveryDate: new Date()
    });

    await delivery.save();
    console.log("✅ Delivery added successfully!");
  } catch (err) {
    console.error("Error adding delivery:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedDelivery();
