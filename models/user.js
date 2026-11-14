const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["customer", "buyer", "farmer", "admin", "retailer", "deliveryBoy"],
    default: "customer"
  },

  address: { type: String },
  phone: { type: String },

  ecoPoints: {
    type: Number,
    default: 0
  },

  ecoStatus: {
    type: String,
    enum: [
      "Eco Beginner",
      "Eco Supporter",
      "Eco Champion",
      "Eco Hero"
    ],
    default: "Eco Beginner"
  },

  greenScore: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);