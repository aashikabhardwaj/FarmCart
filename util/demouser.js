const User = require("../models/user");

// Demo user getter (auto-create if not exists)
async function getDemoUser() {
  let demoUser = await User.findOne({ email: "demo@example.com" });
  if (!demoUser) {
    demoUser = await User.create({
      name: "Demo User",
      email: "demo@example.com",
      password: "password123" // temp password
    });
  }
  return demoUser;
}

module.exports = getDemoUser;
